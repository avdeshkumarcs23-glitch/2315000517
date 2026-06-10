import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from "@mui/material";

import type { NotificationFilter } from "../features/notifications/types";

const TYPES: NotificationFilter[] = [
  "All",
  "Placement",
  "Result",
  "Event",
];

interface Props {
  type: NotificationFilter;
  onTypeChange: (value: NotificationFilter) => void;
  limit?: number;
  onLimitChange?: (value: number) => void;
}

export function FilterControls({
  type,
  onTypeChange,
  limit,
  onLimitChange,
}: Props) {
  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
      <FormControl size="small" sx={{ minWidth: 170 }}>
        <InputLabel id="type-filter-label">Notification type</InputLabel>
        <Select
          labelId="type-filter-label"
          value={type}
          label="Notification type"
          onChange={(event) =>
            onTypeChange(event.target.value as NotificationFilter)
          }
        >
          {TYPES.map((item) => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {limit && onLimitChange ? (
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel id="limit-label">Show top</InputLabel>
          <Select
            labelId="limit-label"
            value={limit}
            label="Show top"
            onChange={(event) => onLimitChange(Number(event.target.value))}
          >
            {[10, 15, 20].map((item) => (
              <MenuItem key={item} value={item}>
                Top {item}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : null}
    </Stack>
  );
}
