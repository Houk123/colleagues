import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Box, Button, Input, NativeSelect, Stack, Text } from "@chakra-ui/react";
import { useCreateWorkLog } from "../model/useWorkLogs.js";

const schema = z.object({
  hours: z.number().min(0),
  minutes: z.number().min(0).max(59),
  serviceId: z.string().min(1, "Выберите услугу"),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface WorkLogFormProps {
  projectId: string;
  taskId: string;
  serviceOptions: { serviceId: string; service: { name: string } }[];
  onSuccess?: () => void;
}

export default function WorkLogForm({ projectId, taskId, serviceOptions, onSuccess }: WorkLogFormProps) {
  const createWorkLog = useCreateWorkLog();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { hours: 0, minutes: 0, serviceId: "", description: "" },
  });

  const onSubmit = async (data: FormData) => {
    const totalMinutes = Math.round(data.hours * 60) + data.minutes;
    await createWorkLog.mutateAsync({
      projectId,
      taskId,
      serviceId: data.serviceId,
      description: data.description,
      time: totalMinutes,
      date: new Date().toISOString().split("T")[0],
    });
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="2">
        <Stack direction="row" gap="2">
          <Box flex="1">
            <Input
              type="number"
              step="0.25"
              placeholder="Часы"
              {...register("hours", {
                valueAsNumber: true,
                onChange: (e) => {
                  const v = Number(e.target.value);
                  setValue("minutes", Math.round(v * 60), { shouldValidate: false });
                },
              })}
            />
            {errors.hours && <Text color="red.500" fontSize="xs">{errors.hours.message}</Text>}
          </Box>
          <Box flex="1">
            <Input
              type="number"
              placeholder="Минуты"
              {...register("minutes", {
                valueAsNumber: true,
                onChange: (e) => {
                  const v = Number(e.target.value);
                  setValue("hours", Number((v / 60).toFixed(2)), { shouldValidate: false });
                },
              })}
            />
            {errors.minutes && <Text color="red.500" fontSize="xs">{errors.minutes.message}</Text>}
          </Box>
          <NativeSelect.Root>
            <NativeSelect.Field placeholder="Услуга" {...register("serviceId")}>
              <option value="">Услуга</option>
              {serviceOptions.map((ps) => (
                <option key={ps.serviceId} value={ps.serviceId}>{ps.service.name}</option>
              ))}
            </NativeSelect.Field>
          </NativeSelect.Root>
        </Stack>
        {errors.serviceId && <Text color="red.500" fontSize="xs">{errors.serviceId.message}</Text>}
        <Input placeholder="Описание работы" {...register("description")} />
        <Button type="submit" loading={isSubmitting || createWorkLog.isPending} size="sm" colorScheme="green">
          Записать время
        </Button>
      </Stack>
    </form>
  );
}
