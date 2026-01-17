import { useEffect } from "react";
import { useQueryStates } from "nuqs";

interface UseSearchProps<Filters extends Record<string, any>> {
  filtersParser: { [K in keyof Filters]: any };
  onFiltersChange?: (filters: Filters) => void;
  defaultValues?: Partial<Filters>;
}

export function useSearch<Filters extends Record<string, any>>({
  filtersParser,
  onFiltersChange,
  defaultValues,
}: UseSearchProps<Filters>) {
  const [filters, setFilters] = useQueryStates(filtersParser, {
    history: "replace",
    ...(defaultValues && { defaultValues }),
  });

  const setFilter = <K extends keyof Filters>(
    field: K,
    value: Filters[K] | undefined
  ) => {
    setFilters((prev) => {
      // Para parâmetros opcionais sem .withDefault(), o nuqs remove da URL quando recebe null
      const shouldRemove = value === undefined || value === "" || value === null;
      
      // Sempre cria um novo objeto para garantir que o nuqs detecte a mudança
      if (shouldRemove) {
        // Passa null explicitamente - o nuqs remove parâmetros opcionais quando recebe null
        return { ...prev, [field]: null };
      }
      
      return { ...prev, [field]: value };
    });
  };

  const resetFilters = () => {
    const defaults = Object.entries(filtersParser).reduce((acc, [key, parser]) => {
      const defaultValue = parser.options?.defaultValue ?? ""; // compatível com parseAsString/Integer.withDefault()
      return { ...acc, [key]: defaultValue };
    }, {} as Partial<Filters>);

    setFilters(defaults);
  };

  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filters as Filters);
    }
  }, [filters, onFiltersChange]);

  return {
    filters,
    setFilters,
    setFilter,
    resetFilters, // <-- novo método
  };
}