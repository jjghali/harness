// Copyright 2022 Harness Inc. All rights reserved.
// Use of this source code is governed by the Polyform Free Trial License
// that can be found in the LICENSE.md file for this repository.

package types

import (
	"github.com/harness/gitness/types/enum"
)

// PullReq represents a pull request.
type PullReq struct {
	ID      int64 `json:"-"` // not returned, it's an internal field
	Version int64 `json:"-"` // not returned, it's an internal field
	Number  int64 `json:"number"`

	CreatedBy int64 `json:"-"` // not returned, because the author info is in the Author field
	Created   int64 `json:"created"`
	Updated   int64 `json:"-"` // not returned, it's updated by the server internally. Clients should use EditedAt.
	Edited    int64 `json:"edited"`

	State   enum.PullReqState `json:"state"`
	IsDraft bool              `json:"is_draft"`

	Title       string `json:"title"`
	Description string `json:"description"`

	SourceRepoID int64  `json:"source_repo_id"`
	SourceBranch string `json:"source_branch"`
	TargetRepoID int64  `json:"target_repo_id"`
	TargetBranch string `json:"target_branch"`

	ActivitySeq int64 `json:"-"` // not returned, because it's a server's internal field

	MergedBy      *int64            `json:"-"` // not returned, because the merger info is in the Merger field
	Merged        *int64            `json:"merged"`
	MergeStrategy *enum.MergeMethod `json:"merge_strategy"`
	MergeHeadSHA  *string           `json:"merge_head_sha"`
	MergeBaseSHA  *string           `json:"merge_base_sha"`

	Author PrincipalInfo  `json:"author"`
	Merger *PrincipalInfo `json:"merger"`
	Stats  PullReqStats   `json:"stats"`
}

// PullReqStats shows total number of conversations,
// commits and how many files modified.
type PullReqStats struct {
	Conversations int64 `json:"conversations"`
	Commits       int   `json:"commits"`
	FilesChanged  int   `json:"files_changed"`
}

// PullReqFilter stores pull request query parameters.
type PullReqFilter struct {
	Page          int                 `json:"page"`
	Size          int                 `json:"size"`
	Query         string              `json:"query"`
	CreatedBy     int64               `json:"created_by"`
	SourceRepoID  int64               `json:"-"` // caller should use source_repo_ref
	SourceRepoRef string              `json:"source_repo_ref"`
	SourceBranch  string              `json:"source_branch"`
	TargetRepoID  int64               `json:"-"`
	TargetBranch  string              `json:"target_branch"`
	States        []enum.PullReqState `json:"state"`
	Sort          enum.PullReqSort    `json:"sort"`
	Order         enum.Order          `json:"order"`
}

// PullReqReview holds pull request review.
type PullReqReview struct {
	ID int64 `json:"id"`

	CreatedBy int64 `json:"created_by"`
	Created   int64 `json:"created"`
	Updated   int64 `json:"updated"`

	PullReqID int64 `json:"pullreq_id"`

	Decision enum.PullReqReviewDecision `json:"decision"`
	SHA      string                     `json:"sha"`
}

// PullReqReviewer holds pull request reviewer.
type PullReqReviewer struct {
	PullReqID   int64 `json:"-"`
	PrincipalID int64 `json:"-"`

	CreatedBy int64 `json:"-"`
	Created   int64 `json:"created"`
	Updated   int64 `json:"updated"`

	RepoID         int64                    `json:"-"`
	Type           enum.PullReqReviewerType `json:"type"`
	LatestReviewID *int64                   `json:"latest_review_id"`

	ReviewDecision enum.PullReqReviewDecision `json:"review_decision"`
	SHA            string                     `json:"sha"`

	Reviewer PrincipalInfo `json:"reviewer"`
	AddedBy  PrincipalInfo `json:"added_by"`
}

type MergeResponse struct {
	SHA string
}