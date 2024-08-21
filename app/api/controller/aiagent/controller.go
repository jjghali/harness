// Copyright 2023 Harness, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package aiagent

import (
	"github.com/harness/gitness/app/auth/authz"
	"github.com/harness/gitness/app/services/aiagent"
	"github.com/harness/gitness/app/store"
)

type Controller struct {
	authorizer     authz.Authorizer
	pipeline       *aiagent.HarnessIntelligence
	repoStore      store.RepoStore
	pipelineStore  store.PipelineStore
	executionStore store.ExecutionStore
}

func NewController(
	authorizer authz.Authorizer,
	pipeline *aiagent.HarnessIntelligence,
	repoStore store.RepoStore,
	pipelineStore store.PipelineStore,
	executionStore store.ExecutionStore,
) *Controller {
	return &Controller{
		authorizer:     authorizer,
		pipeline:       pipeline,
		repoStore:      repoStore,
		pipelineStore:  pipelineStore,
		executionStore: executionStore,
	}
}