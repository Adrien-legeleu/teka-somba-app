-- CreateIndex
CREATE INDEX "Ad_userId_idx" ON "public"."Ad"("userId");

-- CreateIndex
CREATE INDEX "Ad_categoryId_idx" ON "public"."Ad"("categoryId");

-- CreateIndex
CREATE INDEX "Ad_price_idx" ON "public"."Ad"("price");

-- CreateIndex
CREATE INDEX "Ad_createdAt_idx" ON "public"."Ad"("createdAt");

-- CreateIndex
CREATE INDEX "Ad_isDon_idx" ON "public"."Ad"("isDon");

-- CreateIndex
CREATE INDEX "Ad_isVip_idx" ON "public"."Ad"("isVip");

-- CreateIndex
CREATE INDEX "Ad_boostUntil_idx" ON "public"."Ad"("boostUntil");

-- CreateIndex
CREATE INDEX "Ad_location_idx" ON "public"."Ad"("location");

-- CreateIndex
CREATE INDEX "Ad_lat_lng_idx" ON "public"."Ad"("lat", "lng");

-- CreateIndex
CREATE INDEX "AdField_adId_idx" ON "public"."AdField"("adId");

-- CreateIndex
CREATE INDEX "AdField_categoryFieldId_idx" ON "public"."AdField"("categoryFieldId");

-- CreateIndex
CREATE INDEX "BaggageRequest_createdAt_idx" ON "public"."BaggageRequest"("createdAt");

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "public"."Category"("parentId");

-- CreateIndex
CREATE INDEX "CategoryField_categoryId_idx" ON "public"."CategoryField"("categoryId");

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "public"."Favorite"("userId");

-- CreateIndex
CREATE INDEX "Favorite_adId_idx" ON "public"."Favorite"("adId");

-- CreateIndex
CREATE INDEX "HelpRequest_userId_idx" ON "public"."HelpRequest"("userId");

-- CreateIndex
CREATE INDEX "HelpRequest_resolved_idx" ON "public"."HelpRequest"("resolved");

-- CreateIndex
CREATE INDEX "HelpRequest_createdAt_idx" ON "public"."HelpRequest"("createdAt");

-- CreateIndex
CREATE INDEX "Message_adId_idx" ON "public"."Message"("adId");

-- CreateIndex
CREATE INDEX "Message_senderId_idx" ON "public"."Message"("senderId");

-- CreateIndex
CREATE INDEX "Message_receiverId_idx" ON "public"."Message"("receiverId");

-- CreateIndex
CREATE INDEX "Message_createdAt_idx" ON "public"."Message"("createdAt");

-- CreateIndex
CREATE INDEX "Message_isRead_idx" ON "public"."Message"("isRead");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "public"."Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "public"."Notification"("read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "public"."Notification"("createdAt");

-- CreateIndex
CREATE INDEX "PremiumOffer_type_idx" ON "public"."PremiumOffer"("type");

-- CreateIndex
CREATE INDEX "PremiumPurchase_userId_idx" ON "public"."PremiumPurchase"("userId");

-- CreateIndex
CREATE INDEX "PremiumPurchase_adId_idx" ON "public"."PremiumPurchase"("adId");

-- CreateIndex
CREATE INDEX "PremiumPurchase_offerId_idx" ON "public"."PremiumPurchase"("offerId");

-- CreateIndex
CREATE INDEX "Report_adId_idx" ON "public"."Report"("adId");

-- CreateIndex
CREATE INDEX "Report_reason_idx" ON "public"."Report"("reason");

-- CreateIndex
CREATE INDEX "Report_createdAt_idx" ON "public"."Report"("createdAt");

-- CreateIndex
CREATE INDEX "User_city_idx" ON "public"."User"("city");

-- CreateIndex
CREATE INDEX "User_isVerified_idx" ON "public"."User"("isVerified");

-- CreateIndex
CREATE INDEX "User_isAdmin_idx" ON "public"."User"("isAdmin");

-- CreateIndex
CREATE INDEX "User_isSuperAdmin_idx" ON "public"."User"("isSuperAdmin");

-- CreateIndex
CREATE INDEX "WalletTransaction_userId_idx" ON "public"."WalletTransaction"("userId");

-- CreateIndex
CREATE INDEX "WalletTransaction_type_idx" ON "public"."WalletTransaction"("type");

-- CreateIndex
CREATE INDEX "WalletTransaction_createdAt_idx" ON "public"."WalletTransaction"("createdAt");
