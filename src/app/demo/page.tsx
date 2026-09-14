import { redirect } from "next/navigation";

/* L ancienne page de demonstration portait une autre marque et un autre theme.
 * La conversation vit maintenant sur la page d accueil. */
export default function DemoPage() {
  redirect("/#miresaka");
}
