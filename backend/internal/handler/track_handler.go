package handler

import (
	"backend/internal/pkg"
	"backend/internal/service"

	"github.com/gin-gonic/gin"
)

type reportTrackRequest struct {
	Events []service.TrackEventPayload `json:"events"`
}

// reportTrackEvents 接收前端打点数据
func reportTrackEvents(c *gin.Context) {
	var req reportTrackRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.Fail(c, "请求参数格式错误")
		return
	}

	if len(req.Events) == 0 {
		pkg.Fail(c, "events 不能为空")
		return
	}

	if err := service.ReportTrackEvents(req.Events, c.ClientIP()); err != nil {
		pkg.Fail(c, err.Error())
		return
	}

	pkg.Success(c, gin.H{"accepted": len(req.Events)})
}

// adminAnalyticsOverview 管理后台打点概览
func adminAnalyticsOverview(c *gin.Context) {
	days := queryInt(c, "days", 7)
	overview, err := service.GetAnalyticsOverview(days)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}
	pkg.Success(c, overview)
}

// adminListTrackEvents 管理后台分页查询打点明细
func adminListTrackEvents(c *gin.Context) {
	eventType := c.Query("eventType")
	page := queryInt(c, "page", 1)
	pageSize := queryInt(c, "pageSize", 20)

	list, total, err := service.GetTrackEvents(eventType, page, pageSize)
	if err != nil {
		pkg.Fail(c, err.Error())
		return
	}

	pkg.PageSuccess(c, list, total, page, pageSize)
}
