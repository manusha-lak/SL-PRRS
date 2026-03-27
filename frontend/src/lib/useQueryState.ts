import { useSearchParams } from "react-router-dom";

export function useQueryState(key: string, defaultValue: string) {
  const [searchParams, setSearchParams] = useSearchParams();
  const value = searchParams.get(key) ?? defaultValue;

  const setValue = (nextValue: string) => {
    const params = new URLSearchParams(searchParams);

    if (nextValue === defaultValue) {
      params.delete(key);
    } else {
      params.set(key, nextValue);
    }

    setSearchParams(params);
  };

  return [value, setValue] as const;
}
