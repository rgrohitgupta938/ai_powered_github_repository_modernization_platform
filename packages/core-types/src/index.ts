export type Severity = "Critical" | "High" | "Medium" | "Low" | "Info";

export interface RepoMetadata {
  id: string;
  nameWithOwner: string;
  owner: string;
  name: string;
}
