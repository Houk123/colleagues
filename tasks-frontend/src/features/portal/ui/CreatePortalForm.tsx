import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Box, Button, Input, Stack, Text } from "@chakra-ui/react";
import { useCreatePortal } from "../model/usePortals.js";

const schema = z.object({
  name: z.string().min(2, "Минимум 2 символа"),
  slug: z.string().min(2, "Минимум 2 символа").regex(/^[a-z0-9-]+$/, "Только латинские буквы, цифры и дефис"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface CreatePortalFormProps {
  onSuccess?: () => void;
}

export default function CreatePortalForm({ onSuccess }: CreatePortalFormProps) {
  const createPortal = useCreatePortal();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createPortal.mutateAsync(data);
      onSuccess?.();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="4">
        <Box>
          <Input placeholder="Название портала" {...register("name")} />
          {errors.name && <Text color="red.500" fontSize="sm">{errors.name.message}</Text>}
        </Box>
        <Box>
          <Input placeholder="Slug (например, my-company)" {...register("slug")} />
          {errors.slug && <Text color="red.500" fontSize="sm">{errors.slug.message}</Text>}
        </Box>
        <Box>
          <Input placeholder="Описание (необязательно)" {...register("description")} />
        </Box>
        <Button type="submit" loading={isSubmitting || createPortal.isPending} colorScheme="blue">
          Создать портал
        </Button>
        {createPortal.isError && (
          <Text color="red.500" fontSize="sm">{createPortal.error?.message || "Ошибка создания"}</Text>
        )}
      </Stack>
    </form>
  );
}
