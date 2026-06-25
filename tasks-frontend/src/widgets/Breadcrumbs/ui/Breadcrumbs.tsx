import { useNavigate, useParams } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { HStack, Text, Button } from "@chakra-ui/react";
import { fetchPortalBySlug } from "@/features/portal/api/portalApi";
import { fetchOrganizationBySlug } from "@/features/organization/api/organizationApi";
import { fetchProjectBySlug } from "@/features/project/api/projectApi";
import { fetchTask } from "@/features/task/api/taskApi";

interface Crumb {
  label: string;
  path?: string;
}

export default function Breadcrumbs() {
  const navigate = useNavigate();
  const { portalSlug, orgSlug, projectSlug, taskId } = useParams<{
    portalSlug?: string;
    orgSlug?: string;
    projectSlug?: string;
    taskId?: string;
  }>();

  const queries = useQueries({
    queries: [
      {
        queryKey: ["portal", portalSlug],
        queryFn: () => fetchPortalBySlug(portalSlug!),
        enabled: !!portalSlug,
      },
      {
        queryKey: ["organization", portalSlug, orgSlug],
        queryFn: () => fetchOrganizationBySlug(portalSlug!, orgSlug!),
        enabled: !!portalSlug && !!orgSlug,
      },
      {
        queryKey: ["project", portalSlug, projectSlug],
        queryFn: () => fetchProjectBySlug(portalSlug!, projectSlug!),
        enabled: !!portalSlug && !!projectSlug,
      },
      {
        queryKey: ["task", taskId],
        queryFn: () => fetchTask(taskId!),
        enabled: !!taskId,
      },
    ],
  });

  const [portal, organization, project, task] = queries;

  const crumbs: Crumb[] = [{ label: "Порталы", path: "/portals" }];

  if (portalSlug) {
    crumbs.push({
      label: portal.data?.name ?? portalSlug,
      path: `/portals/${portalSlug}`,
    });
  }

  if (orgSlug) {
    crumbs.push({
      label: organization.data?.name ?? orgSlug,
      path: `/portals/${portalSlug}/organizations/${orgSlug}`,
    });
  }

  if (projectSlug) {
    crumbs.push({
      label: project.data?.name ?? projectSlug,
      path: `/portals/${portalSlug}/organizations/${orgSlug}/projects/${projectSlug}`,
    });
  }

  if (taskId) {
    crumbs.push({
      label: task.data?.title ?? `Задача ${taskId.slice(0, 6)}`,
      path: `/portals/${portalSlug}/organizations/${orgSlug}/projects/${projectSlug}/tasks/${taskId}`,
    });
  }

  return (
    <HStack gap="1" mb="4" flexWrap="wrap">
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <HStack key={crumb.path ?? crumb.label} gap="1">
            {crumb.path && !isLast ? (
              <Button
                variant="ghost"
                size="sm"
                px="1"
                py="0"
                h="auto"
                fontWeight="medium"
                color="gray.500"
                onClick={() => navigate(crumb.path!)}
              >
                {crumb.label}
              </Button>
            ) : (
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                {crumb.label}
              </Text>
            )}
            {!isLast && (
              <Text fontSize="sm" color="gray.400">
                /
              </Text>
            )}
          </HStack>
        );
      })}
    </HStack>
  );
}
