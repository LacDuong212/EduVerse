import asyncHandler from "#utils/asyncHandler.js";
import { sendSuccessResponse } from "#utils/response.js";
import * as certificateService from "./certificate.service.js";
import { toCertificateDto, toCertificateListItemDto } from "./certificate.mapper.js";

// GET /api/certificates/:certId — public verification
export const verifyCertificate = asyncHandler(async (req, res) => {
  const progress = await certificateService.getCertificateByCertId(req.params.certId);
  sendSuccessResponse(res, 200, "Certificate verified.", toCertificateDto(progress));
});

// GET /api/certificates/me — current user's certificates
export const listMyCertificates = asyncHandler(async (req, res) => {
  const items = await certificateService.listMyCertificates(req.user.userId);
  sendSuccessResponse(res, 200, "Certificates fetched.", items.map(toCertificateListItemDto));
});

// POST /api/certificates/courses/:courseId/issue — protected, issue for current user
export const issueCertificate = asyncHandler(async (req, res) => {
  const progress = await certificateService.issueCertificate(
    req.user.userId,
    req.params.courseId
  );
  sendSuccessResponse(res, 200, "Certificate issued.", toCertificateDto(progress));
});
