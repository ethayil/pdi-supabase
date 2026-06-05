import { serverSession } from "@/lib/auth-server";
import prisma from "@/lib/prisma";

export default async function Home() {
  const users = await prisma.user.findMany();

  // const { session, user } = await serverSession();
  // console.log({ user });

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50  dark:bg-black">
      <main>
        <ol className="list-decimal list-inside">
          {users?.map((user) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ol>
      </main>
    </div>
  );
}
