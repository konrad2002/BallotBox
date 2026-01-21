import { defineConfig } from "prisma/config";

export default defineConfig({
    migrate: {
        adapter: {
            provider: "sqlite",
            url: process.env.DATABASE_URL ?? "file:./dev.db",
        },
    },
});
