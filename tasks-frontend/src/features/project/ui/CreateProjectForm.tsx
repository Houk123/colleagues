import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Box, Button, Input, Stack, Text } from "@chakra-ui/react";
import { useCreateProject } from "../model/useProjects";

const schema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CreateProjectFormProps {
  portalId: string;
  organizationId: string;
  onSuccess?: () => void;
}

export default function CreateProjectForm({ portalId, organizationId, onSuccess }: CreateProjectFormProps) {
  const createProject = useCreateProject();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await createProject.mutateAsync({ ...data, portalId, organizationId });
      onSuccess?.();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="4">
        <Box>
          <Input placeholder="Название проекта" {...register("name")} />
          {errors.name && <Text color="red.500" fontSize="sm">{errors.name.message}</Text>}
        </Box>
        <Box>
          <Input placeholder="Описание (необязательно)" {...register("description")} />
        </Box>
        <Button type="submit" loading={isSubmitting || createProject.isPending} colorPalette="blue">
          Создать проект
        </Button>
        {createProject.isError && (
          <Text color="red.500" fontSize="sm">{createProject.error?.message || "Ошибка создания"}</Text>
        )}
      </Stack>
    </form>
  );
}
