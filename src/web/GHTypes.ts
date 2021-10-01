export type GHEvent =
  | "branch_protection_rule"
  | "check_run"
  | "check_suite"
  | "code_scanning_alert"
  | "commit_comment"
  | "content_reference"
  | "create"
  | "delete"
  | "deploy_key"
  | "deployment"
  | "deployment_status"
  | "discussion"
  | "discussion_comment"
  | "fork"
  | "github_app_authorization"
  | "gollum"
  | "installation"
  | "installation_repositories"
  | "issue_comment"
  | "issues"
  | "label"
  | "marketplace_purchase"
  | "member"
  | "membership"
  | "meta"
  | "milestone"
  | "organization"
  | "org_block"
  | "package"
  | "page_build"
  | "ping"
  | "project_card"
  | "project_column"
  | "project"
  | "public"
  | "pull_request"
  | "pull_request_review"
  | "pull_request_review_comment"
  | "push"
  | "release"
  | "repository"
  | "repository_dispatch"
  | "repository_import"
  | "repository_vulnerability_alert"
  | "secret_scanning_alert"
  | "security_advisory"
  | "sponsorship"
  | "star"
  | "status"
  | "team"
  | "team_add"
  | "watch"
  | "workflow_dispatch"
  | "workflow_job"
  | "workflow_run";

export interface IPayload {
  action: string;
  sender: {
    login: string;
    id: number;
    node_id: string;
    avatar_url: string;
    gravatar_id: string;
    url: string;
    html_url: string;
    followers_url: string;
    following_url: string;
    gists_url: string;
    starred_url: string;
    subscriptions_url: string;
    organizations_url: string;
    repos_url: string;
    events_url: string;
    received_events_url: string;
    type: string;
    site_admin: boolean;
  };
  installation: {
    id: number;
    node_id?: string;
    [key: string]: any;
  };
  [key: string]: any;
}
