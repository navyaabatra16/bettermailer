import { redirect } from "next/navigation";

import {
  DEFAULT_AUTHENTICATED_ROUTE,
  DEFAULT_UNAUTHENTICATED_ROUTE,
  isAuthenticated,
} from "@/lib/auth";

export default async function Home() {
  redirect(
    (await isAuthenticated())
      ? DEFAULT_AUTHENTICATED_ROUTE
      : DEFAULT_UNAUTHENTICATED_ROUTE
  );
}
