import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import EmployeeDetailClient from "./EmployeeDetailClient";

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const cookieStore = await cookies();
    const session = cookieStore.get("session");

    if (!session) {
        redirect("/login");
    }

    const user = JSON.parse(session.value);
    if (user.role !== "DIRECTOR") {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <EmployeeDetailClient employeeId={id} />
        </div>
    );
}
