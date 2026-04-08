package service

import (
	"backend/internal/model"
	"backend/internal/repository"
	"encoding/json"
	"errors"
	"strings"
	"time"
)

var allowedEventTypes = map[string]bool{
	"exposure": true,
	"click":    true,
	"error":    true,
	"custom":   true,
}

type TrackEventPayload struct {
	EventType   string         `json:"eventType"`
	EventName   string         `json:"eventName"`
	PagePath    string         `json:"pagePath"`
	PageURL     string         `json:"pageUrl"`
	Referrer    string         `json:"referrer"`
	UserAgent   string         `json:"userAgent"`
	Language    string         `json:"language"`
	TimeZone    string         `json:"timeZone"`
	Screen      string         `json:"screen"`
	SessionID   string         `json:"sessionId"`
	AnonymousID string         `json:"anonymousId"`
	UserID      string         `json:"userId"`
	Role        string         `json:"role"`
	IP          string         `json:"ip"`
	City        string         `json:"city"`
	Country     string         `json:"country"`
	LogTime     string         `json:"logTime"`
	IsLoggedIn  bool           `json:"isLoggedIn"`
	UserInfo    map[string]any `json:"userInfo"`
	OccurredAt  string         `json:"occurredAt"`
	Meta        map[string]any `json:"meta"`
}

type AnalyticsOverview struct {
	Days         int                         `json:"days"`
	TotalEvents  int64                       `json:"totalEvents"`
	TotalPV      int64                       `json:"totalPv"`
	TotalUV      int64                       `json:"totalUv"`
	PVPerUV      float64                     `json:"pvPerUv"`
	TypeCounts   []repository.EventTypeCount `json:"typeCounts"`
	DailyCounts  []repository.DailyCount     `json:"dailyCounts"`
	DailyTraffic []repository.DailyTrafficCount `json:"dailyTraffic"`
	TopPages     []repository.TopPage        `json:"topPages"`
	TopEvents    []repository.TopEvent       `json:"topEvents"`
	RecentErrors []model.TrackEvent          `json:"recentErrors"`
	UpdatedAt    time.Time                   `json:"updatedAt"`
}

func parseTime(raw string) time.Time {
	if strings.TrimSpace(raw) == "" {
		return time.Now()
	}
	if t, err := time.Parse(time.RFC3339, raw); err == nil {
		return t
	}
	return time.Now()
}

func pickUserID(payload TrackEventPayload) string {
	if v := strings.TrimSpace(payload.UserID); v != "" {
		return v
	}
	if payload.UserInfo == nil {
		return ""
	}
	for _, key := range []string{"userId", "id", "uuid"} {
		if raw, ok := payload.UserInfo[key]; ok {
			if v := strings.TrimSpace(strings.TrimSpace(toString(raw))); v != "" {
				return v
			}
		}
	}
	return ""
}

func pickRole(payload TrackEventPayload) string {
	if v := strings.TrimSpace(payload.Role); v != "" {
		return v
	}
	if payload.UserInfo == nil {
		return ""
	}
	if raw, ok := payload.UserInfo["role"]; ok {
		return strings.TrimSpace(toString(raw))
	}
	return ""
}

func toString(v any) string {
	if v == nil {
		return ""
	}
	if s, ok := v.(string); ok {
		return s
	}
	return strings.TrimSpace(strings.ReplaceAll(strings.Trim(fmtAny(v), "\""), "\n", " "))
}

func fmtAny(v any) string {
	b, err := json.Marshal(v)
	if err != nil {
		return ""
	}
	return string(b)
}

func toTrackEvent(payload TrackEventPayload, ip string) (model.TrackEvent, error) {
	eventType := strings.ToLower(strings.TrimSpace(payload.EventType))
	if !allowedEventTypes[eventType] {
		return model.TrackEvent{}, errors.New("不支持的事件类型")
	}

	eventName := strings.TrimSpace(payload.EventName)
	if eventName == "" {
		return model.TrackEvent{}, errors.New("eventName 不能为空")
	}

	metaJSON := "{}"
	if payload.Meta != nil {
		if raw, err := json.Marshal(payload.Meta); err == nil {
			metaJSON = string(raw)
		}
	}

	userInfoJSON := "{}"
	if payload.UserInfo != nil {
		if raw, err := json.Marshal(payload.UserInfo); err == nil {
			userInfoJSON = string(raw)
		}
	}

	effectiveIP := strings.TrimSpace(payload.IP)
	if effectiveIP == "" {
		effectiveIP = strings.TrimSpace(ip)
	}

	logTime := parseTime(payload.LogTime)
	occurredAt := parseTime(payload.OccurredAt)

	return model.TrackEvent{
		EventType:   eventType,
		EventName:   eventName,
		PagePath:    strings.TrimSpace(payload.PagePath),
		PageURL:     strings.TrimSpace(payload.PageURL),
		Referrer:    strings.TrimSpace(payload.Referrer),
		UserAgent:   strings.TrimSpace(payload.UserAgent),
		Language:    strings.TrimSpace(payload.Language),
		TimeZone:    strings.TrimSpace(payload.TimeZone),
		Screen:      strings.TrimSpace(payload.Screen),
		SessionID:   strings.TrimSpace(payload.SessionID),
		AnonymousID: strings.TrimSpace(payload.AnonymousID),
		UserUUID:    pickUserID(payload),
		Role:        pickRole(payload),
		IP:          effectiveIP,
		City:        strings.TrimSpace(payload.City),
		Country:     strings.TrimSpace(payload.Country),
		IsLoggedIn:  payload.IsLoggedIn,
		LogTime:     logTime,
		OccurredAt:  occurredAt,
		UserInfo:    userInfoJSON,
		MetaJSON:    metaJSON,
	}, nil
}

func ReportTrackEvents(payloads []TrackEventPayload, ip string) error {
	if len(payloads) == 0 {
		return errors.New("事件列表不能为空")
	}

	rows := make([]model.TrackEvent, 0, len(payloads))
	for _, item := range payloads {
		row, err := toTrackEvent(item, ip)
		if err != nil {
			return err
		}
		rows = append(rows, row)
	}

	return repository.CreateTrackEvents(rows)
}

func GetAnalyticsOverview(days int) (*AnalyticsOverview, error) {
	if days <= 0 || days > 90 {
		days = 7
	}

	since := time.Now().AddDate(0, 0, -days+1)

	total, err := repository.CountTrackEvents(since)
	if err != nil {
		return nil, err
	}

	totalPV, err := repository.CountTrackPV(since)
	if err != nil {
		return nil, err
	}

	totalUV, err := repository.CountTrackUV(since)
	if err != nil {
		return nil, err
	}

	typeCounts, err := repository.CountTrackEventsByType(since)
	if err != nil {
		return nil, err
	}

	dailyCounts, err := repository.CountTrackEventsDaily(since)
	if err != nil {
		return nil, err
	}

	dailyTraffic, err := repository.CountTrackTrafficDaily(since)
	if err != nil {
		return nil, err
	}

	topPages, err := repository.TopTrackPages(since, 10)
	if err != nil {
		return nil, err
	}

	topEvents, err := repository.TopTrackEvents(since, 10)
	if err != nil {
		return nil, err
	}

	recentErrors, err := repository.ListRecentErrorEvents(since, 20)
	if err != nil {
		return nil, err
	}

	pvPerUV := 0.0
	if totalUV > 0 {
		pvPerUV = float64(totalPV) / float64(totalUV)
	}

	return &AnalyticsOverview{
		Days:         days,
		TotalEvents:  total,
		TotalPV:      totalPV,
		TotalUV:      totalUV,
		PVPerUV:      pvPerUV,
		TypeCounts:   typeCounts,
		DailyCounts:  dailyCounts,
		DailyTraffic: dailyTraffic,
		TopPages:     topPages,
		TopEvents:    topEvents,
		RecentErrors: recentErrors,
		UpdatedAt:    time.Now(),
	}, nil
}

func GetTrackEvents(eventType string, page, pageSize int) ([]model.TrackEvent, int64, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}

	eventType = strings.ToLower(strings.TrimSpace(eventType))
	if eventType != "" && !allowedEventTypes[eventType] {
		return nil, 0, errors.New("eventType 参数无效")
	}

	return repository.ListTrackEvents(eventType, page, pageSize)
}
