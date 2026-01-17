//@ts-nocheck
"use client"
import { useForm, type UseFormProps, type UseFormReturn, type FieldValues } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { type z, type ZodType } from "zod"

export function useZodForm<TSchema extends ZodType>(
  schema: TSchema,
  options?: UseFormProps<z.infer<TSchema>>
): UseFormReturn<z.infer<TSchema>> {
  const { defaultValues, ...restOptions } = options || {}

  type FormValues = z.infer<TSchema>

  return useForm<FormValues>({
    resolver: zodResolver(schema as never),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues,
    ...restOptions,
  })
}
