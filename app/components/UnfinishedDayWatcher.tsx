"use client";

import { usePathname, useRouter } from "next/navigation";
import { useUnfinishedDayWarning } from "@/app/lib/useUnfinishedDayWarning";

// App-wide unfinished-day warning for every page except Today, which runs its own instance (so
// a click there can switch its already-mounted day in place). Clicking here opens Today on that
// day; Today's mount effect reads the ?date= param.
export default function UnfinishedDayWatcher() {
  const router = useRouter();
  const pathname = usePathname();
  useUnfinishedDayWarning((day) => router.push(`/?date=${day}`), pathname !== "/");
  return null;
}
