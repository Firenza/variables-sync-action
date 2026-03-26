/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { vi, test, expect, beforeEach } from "vitest";

// @ts-ignore-next-line
import fixture from "@octokit/fixtures/scenarios/api.github.com/get-repository/normalized-fixture.json";
import nock from "nock";

vi.mock("../src/config");
vi.mock("../src/github");
vi.mock("../src/variables");

import * as config from "../src/config";
import * as github from "../src/github";
import * as variables from "../src/variables";
import { run } from "../src/main";

nock.disableNetConnect();

beforeEach(() => {
  vi.restoreAllMocks();
});

test("run should succeed with a repo and variable", async () => {
  vi.mocked(github.listAllMatchingRepos).mockResolvedValue([
    fixture[0].response,
  ]);

  vi.mocked(github.setVariableForRepo).mockResolvedValue(undefined as any);

  vi.mocked(variables.getVariables).mockReturnValue({
    BAZ: "bar",
  });

  vi.mocked(config.getConfig).mockReturnValue({
    GITHUB_TOKEN: "token",
    SECRETS: ["BAZ"],
    REPOSITORIES: [".*"],
    REPOSITORIES_LIST_REGEX: true,
    DRY_RUN: false,
    RETRIES: 3,
    CONCURRENCY: 1,
    TARGET: "actions",
  } as any);
  await run();

  expect(github.listAllMatchingRepos).toHaveBeenCalledTimes(1);
  expect(vi.mocked(github.setVariableForRepo).mock.calls[0][3]).toEqual(
    fixture[0].response
  );

  expect(process.exitCode).toBe(undefined);
});

test("run should succeed with a repo and variable with repository_list_regex as false", async () => {
  vi.mocked(github.getRepos).mockResolvedValue([fixture[0].response]);

  vi.mocked(github.setVariableForRepo).mockResolvedValue(undefined as any);

  vi.mocked(variables.getVariables).mockReturnValue({
    BAZ: "bar",
  });

  vi.mocked(config.getConfig).mockReturnValue({
    GITHUB_TOKEN: "token",
    SECRETS: ["BAZ"],
    REPOSITORIES: [fixture[0].response.full_name],
    REPOSITORIES_LIST_REGEX: false,
    DRY_RUN: false,
    CONCURRENCY: 1,
    TARGET: "actions",
  } as any);
  await run();

  expect(github.getRepos).toHaveBeenCalledTimes(1);
  expect(vi.mocked(github.setVariableForRepo).mock.calls[0][3]).toEqual(
    fixture[0].response
  );

  expect(process.exitCode).toBe(undefined);
});

test("run should succeed with delete enabled, a repo and variable with repository_list_regex as false", async () => {
  vi.mocked(github.deleteVariableForRepo).mockResolvedValue(undefined as any);

  vi.mocked(github.getRepos).mockResolvedValue([fixture[0].response]);

  vi.mocked(variables.getVariables).mockReturnValue({
    BAZ: "bar",
  });

  vi.mocked(config.getConfig).mockReturnValue({
    GITHUB_TOKEN: "token",
    VARIABLES: ["BAZ"],
    REPOSITORIES: [fixture[0].response.full_name],
    REPOSITORIES_LIST_REGEX: false,
    DRY_RUN: false,
    RUN_DELETE: true,
    CONCURRENCY: 1,
    TARGET: "actions",
  } as any);
  await run();

  expect(github.deleteVariableForRepo).toHaveBeenCalledTimes(1);
  expect(process.exitCode).toBe(undefined);
});
