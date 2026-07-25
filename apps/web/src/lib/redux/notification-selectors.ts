import { createSelector } from "@reduxjs/toolkit";
import { useAppSelector } from "./store";
import type { RootState } from "./store";

const selectItems = (state: RootState) => state.notifications.items;

export const selectUnreadCount = createSelector(
  [selectItems],
  (items) => items.filter((n) => !n.read).length,
);

/** Stable reference for list rendering — only changes when notification items change */
export function useNotificationItems() {
  return useAppSelector(selectItems);
}
