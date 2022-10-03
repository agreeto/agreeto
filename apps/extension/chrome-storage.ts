import { z } from "zod"

import { AccessTokenSchema } from "~features/auth"

export const ChromeStorage = AccessTokenSchema.optional()
