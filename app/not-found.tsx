import { FileQuestion } from "lucide-react";
import * as motion from "motion/react-client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { TextRevealEffect } from "@/components/ui/text-reveal-effects";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="space-y-1">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.15,
              }}
              className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted"
            >
              <FileQuestion className="h-6 w-6 text-muted-foreground" />
            </motion.div>
            <TextRevealEffect
              text="Page Not Found"
              className="text-center text-2xl font-bold block"
            />
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-center text-muted-foreground mt-2"
            >
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved.
            </motion.p>
          </CardHeader>
          <CardFooter>
            <Link href="/" className="w-full">
              <Button className="w-full">Go Home</Button>
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
