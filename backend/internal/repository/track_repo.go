package repository

import (
	"backend/internal/model"
	"time"
)

type EventTypeCount struct {
	EventType string `json:"eventType"`
	Count     int64  `json:"count"`
}

type DailyCount struct {
	Date  string `json:"date"`
	Count int64  `json:"count"`
}

type TopPage struct {
	PagePath string `json:"pagePath"`
	Count    int64  `json:"count"`
}

type TopEvent struct {
	EventName string `json:"eventName"`
	Count     int64  `json:"count"`
}

func CreateTrackEvents(events []model.TrackEvent) error {
	if len(events) == 0 {
		return nil
	}
	return DB.Create(&events).Error
}

func CountTrackEvents(since time.Time) (int64, error) {
	var total int64
	err := DB.Model(&model.TrackEvent{}).
		Where("occurred_at >= ?", since).
		Count(&total).Error
	return total, err
}

func CountTrackEventsByType(since time.Time) ([]EventTypeCount, error) {
	var rows []EventTypeCount
	err := DB.Model(&model.TrackEvent{}).
		Select("event_type, COUNT(*) as count").
		Where("occurred_at >= ?", since).
		Group("event_type").
		Order("count DESC").
		Scan(&rows).Error
	return rows, err
}

func CountTrackEventsDaily(since time.Time) ([]DailyCount, error) {
	var rows []DailyCount
	err := DB.Model(&model.TrackEvent{}).
		Select("DATE(occurred_at) as date, COUNT(*) as count").
		Where("occurred_at >= ?", since).
		Group("DATE(occurred_at)").
		Order("date ASC").
		Scan(&rows).Error
	return rows, err
}

func TopTrackPages(since time.Time, limit int) ([]TopPage, error) {
	var rows []TopPage
	err := DB.Model(&model.TrackEvent{}).
		Select("page_path, COUNT(*) as count").
		Where("occurred_at >= ?", since).
		Where("page_path <> ''").
		Group("page_path").
		Order("count DESC").
		Limit(limit).
		Scan(&rows).Error
	return rows, err
}

func TopTrackEvents(since time.Time, limit int) ([]TopEvent, error) {
	var rows []TopEvent
	err := DB.Model(&model.TrackEvent{}).
		Select("event_name, COUNT(*) as count").
		Where("occurred_at >= ?", since).
		Group("event_name").
		Order("count DESC").
		Limit(limit).
		Scan(&rows).Error
	return rows, err
}

func ListRecentErrorEvents(since time.Time, limit int) ([]model.TrackEvent, error) {
	var rows []model.TrackEvent
	err := DB.Where("occurred_at >= ?", since).
		Where("event_type = ?", "error").
		Order("occurred_at DESC").
		Limit(limit).
		Find(&rows).Error
	return rows, err
}

func ListTrackEvents(eventType string, page, pageSize int) ([]model.TrackEvent, int64, error) {
	var rows []model.TrackEvent
	var total int64

	q := DB.Model(&model.TrackEvent{})
	if eventType != "" {
		q = q.Where("event_type = ?", eventType)
	}

	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := q.Order("occurred_at DESC").
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Find(&rows).Error

	return rows, total, err
}
