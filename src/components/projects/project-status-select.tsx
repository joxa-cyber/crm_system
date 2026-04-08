"use client";

import { updateProjectStatus } from "@/actions/projects";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROJECT_STATUS_LABELS } from "@/lib/formatters";

export function ProjectStatusSelect({
  projectId,
  currentStatus,
}: {
  projectId: string;
  currentStatus: string;
}) {
  return (
    <Select
      defaultValue={currentStatus}
      onValueChange={async (value: string | null) => {
        if (value) await updateProjectStatus(projectId, value);
      }}
    >
      <SelectTrigger className="w-[160px] h-9">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
