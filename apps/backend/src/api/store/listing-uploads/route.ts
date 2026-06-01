import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"

type UploadListingImagesBody = {
  files?: {
    filename?: string
    mimeType?: string
    content?: string
  }[]
}

const MAX_FILES = 6
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

export async function POST(
  req: AuthenticatedMedusaRequest<UploadListingImagesBody>,
  res: MedusaResponse
) {
  const files = req.body.files ?? []

  if (!files.length) {
    res.status(400).json({ message: "At least one image is required." })
    return
  }

  if (files.length > MAX_FILES) {
    res.status(400).json({ message: `Upload up to ${MAX_FILES} images.` })
    return
  }

  const uploadFiles = files.map((file) => {
    const filename = file.filename?.trim()
    const mimeType = file.mimeType?.trim()
    const content = file.content?.trim()

    if (!filename || !mimeType || !content) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Each image needs a filename, MIME type, and content."
      )
    }

    if (!mimeType.startsWith("image/")) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Only image uploads are supported."
      )
    }

    const size = Buffer.byteLength(content, "base64")

    if (size > MAX_FILE_SIZE_BYTES) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Each image must be 5MB or smaller."
      )
    }

    return {
      filename,
      mimeType,
      content,
      access: "public" as const,
    }
  })

  const { result } = await uploadFilesWorkflow(req.scope).run({
    input: {
      files: uploadFiles,
    },
  })

  res.status(200).json({ files: result })
}
