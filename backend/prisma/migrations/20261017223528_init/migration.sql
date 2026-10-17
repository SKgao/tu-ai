-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "account" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "avatar" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "name" TEXT,
    "sex" INTEGER,
    "status" INTEGER NOT NULL DEFAULT 1,
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "roleId" INTEGER NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberLevel" (
    "userLevel" INTEGER NOT NULL,
    "levelName" TEXT NOT NULL,
    "explainInfo" TEXT DEFAULT '',
    "exprieDays" INTEGER DEFAULT 0,
    "orgMoney" INTEGER DEFAULT 0,
    "needMoney" INTEGER DEFAULT 0,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MemberLevel_pkey" PRIMARY KEY ("userLevel")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" SERIAL NOT NULL,
    "tutuNumber" INTEGER NOT NULL,
    "realName" TEXT NOT NULL,
    "icon" TEXT,
    "inviteCount" INTEGER NOT NULL DEFAULT 0,
    "channel" INTEGER NOT NULL DEFAULT 1,
    "hasBuyTextbook" INTEGER NOT NULL DEFAULT 0,
    "payTime" TIMESTAMP(3),
    "exprieTime" TIMESTAMP(3),
    "userMoney" INTEGER NOT NULL DEFAULT 0,
    "mobile" TEXT,
    "email" TEXT,
    "birthday" TIMESTAMP(3),
    "sex" INTEGER,
    "hasSetPassword" INTEGER NOT NULL DEFAULT 1,
    "bookVersionName" TEXT,
    "textbookNamePractice" TEXT,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userLevel" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberFeedback" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "icon" TEXT,
    "activeMoney" INTEGER,
    "status" INTEGER NOT NULL DEFAULT 1,
    "activityType" INTEGER NOT NULL DEFAULT 1,
    "itemId" INTEGER,
    "activeExpireDays" INTEGER,
    "beginAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grade" (
    "id" SERIAL NOT NULL,
    "gradeName" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookVersion" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseBag" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "icon" TEXT,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseBag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseBagCourse" (
    "id" SERIAL NOT NULL,
    "bagId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseBagCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseBagActivity" (
    "id" INTEGER NOT NULL,
    "textbookId" INTEGER NOT NULL,
    "teacher" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "type" INTEGER NOT NULL DEFAULT 1,
    "saleBeginAt" TIMESTAMP(3) NOT NULL,
    "saleEndAt" TIMESTAMP(3) NOT NULL,
    "beginAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "orgAmt" INTEGER NOT NULL DEFAULT 0,
    "amt" INTEGER NOT NULL DEFAULT 0,
    "num" INTEGER NOT NULL DEFAULT 0,
    "chatNo" TEXT,
    "iconDetail" TEXT,
    "iconTicket" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseBagActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpecialCourse" (
    "textbookId" INTEGER NOT NULL,
    "textbookName" TEXT NOT NULL,
    "teacher" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 1,
    "type" INTEGER NOT NULL DEFAULT 1,
    "saleBeginAt" TIMESTAMP(3) NOT NULL,
    "saleEndAt" TIMESTAMP(3) NOT NULL,
    "beginAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "orgAmt" INTEGER NOT NULL DEFAULT 0,
    "amt" INTEGER NOT NULL DEFAULT 0,
    "num" INTEGER NOT NULL DEFAULT 0,
    "chatNo" TEXT,
    "iconDetail" TEXT,
    "iconTicket" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpecialCourse_pkey" PRIMARY KEY ("textbookId")
);

-- CreateTable
CREATE TABLE "Course" (
    "textbookId" INTEGER NOT NULL,
    "textbookName" TEXT NOT NULL,
    "icon" TEXT,
    "gradeId" INTEGER,
    "bookVersionId" INTEGER,
    "sortValue" INTEGER NOT NULL DEFAULT 0,
    "canLock" INTEGER NOT NULL DEFAULT 1,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("textbookId")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "orderNo" TEXT NOT NULL,
    "memberId" INTEGER NOT NULL,
    "itemId" INTEGER,
    "itemName" TEXT NOT NULL,
    "orderAmount" INTEGER NOT NULL DEFAULT 0,
    "payType" INTEGER NOT NULL DEFAULT 1,
    "orderStatus" INTEGER NOT NULL DEFAULT 1,
    "payTime" TIMESTAMP(3),
    "outNo" TEXT,
    "cancelReason" TEXT,
    "activityId" INTEGER,
    "textbookId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" SERIAL NOT NULL,
    "parentId" INTEGER,
    "menuName" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "menuScope" INTEGER NOT NULL DEFAULT 1,
    "url" TEXT NOT NULL DEFAULT '',
    "status" INTEGER NOT NULL DEFAULT 1,
    "sortValue" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoleMenu" (
    "roleId" INTEGER NOT NULL,
    "menuId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoleMenu_pkey" PRIMARY KEY ("roleId","menuId")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "icon" TEXT DEFAULT '',
    "sort" INTEGER NOT NULL DEFAULT 0,
    "canLock" INTEGER NOT NULL DEFAULT 1,
    "status" INTEGER NOT NULL DEFAULT 1,
    "textbookId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Part" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "icon" TEXT DEFAULT '',
    "tips" TEXT DEFAULT '',
    "sort" INTEGER NOT NULL DEFAULT 0,
    "canLock" INTEGER NOT NULL DEFAULT 1,
    "unitsId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Part_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pass" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "tmpTitle" TEXT DEFAULT '',
    "icon" TEXT DEFAULT '',
    "sort" INTEGER NOT NULL DEFAULT 0,
    "partsId" INTEGER,
    "textbookId" INTEGER,
    "subject" INTEGER,
    "customerNumber" INTEGER NOT NULL DEFAULT 0,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" INTEGER NOT NULL,
    "textbookId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "icon" TEXT DEFAULT '',
    "sort" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionCustomPass" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "customPassId" INTEGER NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SessionCustomPass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" SERIAL NOT NULL,
    "customsPassId" INTEGER NOT NULL,
    "partId" INTEGER,
    "sessionId" INTEGER,
    "subject" INTEGER,
    "sourceIds" TEXT NOT NULL DEFAULT '',
    "sort" INTEGER NOT NULL DEFAULT 0,
    "showIndex" TEXT DEFAULT '',
    "icon" TEXT DEFAULT '',
    "audio" TEXT DEFAULT '',
    "sentenceAudio" TEXT DEFAULT '',
    "sceneGraph" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SourceMaterial" (
    "id" SERIAL NOT NULL,
    "textbookId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "icon" TEXT DEFAULT '',
    "audio" TEXT DEFAULT '',
    "translation" TEXT DEFAULT '',
    "explainsArray" TEXT DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SourceMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberInvite" (
    "id" SERIAL NOT NULL,
    "inviterId" INTEGER NOT NULL,
    "inviteeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemberInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningRecord" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,
    "textbookId" INTEGER,
    "unitId" INTEGER,
    "partId" INTEGER,
    "sessionId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sort" INTEGER NOT NULL DEFAULT 0,
    "status" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubjectType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_account_key" ON "User"("account");

-- CreateIndex
CREATE UNIQUE INDEX "Member_tutuNumber_key" ON "Member"("tutuNumber");

-- CreateIndex
CREATE INDEX "Member_userLevel_idx" ON "Member"("userLevel");

-- CreateIndex
CREATE INDEX "Member_status_idx" ON "Member"("status");

-- CreateIndex
CREATE INDEX "Member_mobile_idx" ON "Member"("mobile");

-- CreateIndex
CREATE INDEX "Member_createdAt_idx" ON "Member"("createdAt");

-- CreateIndex
CREATE INDEX "Member_payTime_idx" ON "Member"("payTime");

-- CreateIndex
CREATE INDEX "Member_exprieTime_idx" ON "Member"("exprieTime");

-- CreateIndex
CREATE INDEX "MemberFeedback_memberId_idx" ON "MemberFeedback"("memberId");

-- CreateIndex
CREATE INDEX "MemberFeedback_createdAt_idx" ON "MemberFeedback"("createdAt");

-- CreateIndex
CREATE INDEX "Activity_status_idx" ON "Activity"("status");

-- CreateIndex
CREATE INDEX "Activity_activityType_idx" ON "Activity"("activityType");

-- CreateIndex
CREATE INDEX "Activity_itemId_idx" ON "Activity"("itemId");

-- CreateIndex
CREATE INDEX "Activity_createdAt_idx" ON "Activity"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Grade_gradeName_key" ON "Grade"("gradeName");

-- CreateIndex
CREATE UNIQUE INDEX "BookVersion_name_key" ON "BookVersion"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CourseBag_title_key" ON "CourseBag"("title");

-- CreateIndex
CREATE INDEX "CourseBag_status_idx" ON "CourseBag"("status");

-- CreateIndex
CREATE INDEX "CourseBag_sort_idx" ON "CourseBag"("sort");

-- CreateIndex
CREATE INDEX "CourseBag_createdAt_idx" ON "CourseBag"("createdAt");

-- CreateIndex
CREATE INDEX "CourseBagCourse_bagId_idx" ON "CourseBagCourse"("bagId");

-- CreateIndex
CREATE INDEX "CourseBagCourse_status_idx" ON "CourseBagCourse"("status");

-- CreateIndex
CREATE INDEX "CourseBagCourse_sort_idx" ON "CourseBagCourse"("sort");

-- CreateIndex
CREATE INDEX "CourseBagCourse_createdAt_idx" ON "CourseBagCourse"("createdAt");

-- CreateIndex
CREATE INDEX "CourseBagActivity_textbookId_idx" ON "CourseBagActivity"("textbookId");

-- CreateIndex
CREATE INDEX "CourseBagActivity_status_idx" ON "CourseBagActivity"("status");

-- CreateIndex
CREATE INDEX "CourseBagActivity_type_idx" ON "CourseBagActivity"("type");

-- CreateIndex
CREATE INDEX "CourseBagActivity_saleBeginAt_idx" ON "CourseBagActivity"("saleBeginAt");

-- CreateIndex
CREATE INDEX "CourseBagActivity_createdAt_idx" ON "CourseBagActivity"("createdAt");

-- CreateIndex
CREATE INDEX "SpecialCourse_status_idx" ON "SpecialCourse"("status");

-- CreateIndex
CREATE INDEX "SpecialCourse_type_idx" ON "SpecialCourse"("type");

-- CreateIndex
CREATE INDEX "SpecialCourse_saleBeginAt_idx" ON "SpecialCourse"("saleBeginAt");

-- CreateIndex
CREATE INDEX "SpecialCourse_saleEndAt_idx" ON "SpecialCourse"("saleEndAt");

-- CreateIndex
CREATE INDEX "SpecialCourse_createdAt_idx" ON "SpecialCourse"("createdAt");

-- CreateIndex
CREATE INDEX "Course_gradeId_idx" ON "Course"("gradeId");

-- CreateIndex
CREATE INDEX "Course_bookVersionId_idx" ON "Course"("bookVersionId");

-- CreateIndex
CREATE INDEX "Course_status_idx" ON "Course"("status");

-- CreateIndex
CREATE INDEX "Course_createdAt_idx" ON "Course"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNo_key" ON "Order"("orderNo");

-- CreateIndex
CREATE INDEX "Order_memberId_idx" ON "Order"("memberId");

-- CreateIndex
CREATE INDEX "Order_itemId_idx" ON "Order"("itemId");

-- CreateIndex
CREATE INDEX "Order_payType_idx" ON "Order"("payType");

-- CreateIndex
CREATE INDEX "Order_orderStatus_idx" ON "Order"("orderStatus");

-- CreateIndex
CREATE INDEX "Order_activityId_idx" ON "Order"("activityId");

-- CreateIndex
CREATE INDEX "Order_textbookId_idx" ON "Order"("textbookId");

-- CreateIndex
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Menu_path_key" ON "Menu"("path");

-- CreateIndex
CREATE INDEX "RoleMenu_menuId_idx" ON "RoleMenu"("menuId");

-- CreateIndex
CREATE INDEX "Unit_textbookId_idx" ON "Unit"("textbookId");

-- CreateIndex
CREATE INDEX "Unit_sort_idx" ON "Unit"("sort");

-- CreateIndex
CREATE INDEX "Unit_createdAt_idx" ON "Unit"("createdAt");

-- CreateIndex
CREATE INDEX "Part_unitsId_idx" ON "Part"("unitsId");

-- CreateIndex
CREATE INDEX "Part_sort_idx" ON "Part"("sort");

-- CreateIndex
CREATE INDEX "Part_createdAt_idx" ON "Part"("createdAt");

-- CreateIndex
CREATE INDEX "Pass_partsId_idx" ON "Pass"("partsId");

-- CreateIndex
CREATE INDEX "Pass_textbookId_idx" ON "Pass"("textbookId");

-- CreateIndex
CREATE INDEX "Pass_sort_idx" ON "Pass"("sort");

-- CreateIndex
CREATE INDEX "Pass_createdAt_idx" ON "Pass"("createdAt");

-- CreateIndex
CREATE INDEX "Session_textbookId_sort_idx" ON "Session"("textbookId", "sort");

-- CreateIndex
CREATE INDEX "SessionCustomPass_sessionId_sort_idx" ON "SessionCustomPass"("sessionId", "sort");

-- CreateIndex
CREATE UNIQUE INDEX "SessionCustomPass_sessionId_customPassId_key" ON "SessionCustomPass"("sessionId", "customPassId");

-- CreateIndex
CREATE INDEX "Subject_customsPassId_sort_idx" ON "Subject"("customsPassId", "sort");

-- CreateIndex
CREATE INDEX "Subject_createdAt_idx" ON "Subject"("createdAt");

-- CreateIndex
CREATE INDEX "SourceMaterial_textbookId_idx" ON "SourceMaterial"("textbookId");

-- CreateIndex
CREATE INDEX "SourceMaterial_text_idx" ON "SourceMaterial"("text");

-- CreateIndex
CREATE INDEX "SourceMaterial_createdAt_idx" ON "SourceMaterial"("createdAt");

-- CreateIndex
CREATE INDEX "MemberInvite_inviterId_createdAt_idx" ON "MemberInvite"("inviterId", "createdAt");

-- CreateIndex
CREATE INDEX "MemberInvite_inviteeId_idx" ON "MemberInvite"("inviteeId");

-- CreateIndex
CREATE UNIQUE INDEX "MemberInvite_inviterId_inviteeId_key" ON "MemberInvite"("inviterId", "inviteeId");

-- CreateIndex
CREATE INDEX "LearningRecord_memberId_createdAt_idx" ON "LearningRecord"("memberId", "createdAt");

-- CreateIndex
CREATE INDEX "SubjectType_sort_idx" ON "SubjectType"("sort");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_userLevel_fkey" FOREIGN KEY ("userLevel") REFERENCES "MemberLevel"("userLevel") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberFeedback" ADD CONSTRAINT "MemberFeedback_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "MemberLevel"("userLevel") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseBagCourse" ADD CONSTRAINT "CourseBagCourse_bagId_fkey" FOREIGN KEY ("bagId") REFERENCES "CourseBag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseBagActivity" ADD CONSTRAINT "CourseBagActivity_textbookId_fkey" FOREIGN KEY ("textbookId") REFERENCES "CourseBagCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpecialCourse" ADD CONSTRAINT "SpecialCourse_textbookId_fkey" FOREIGN KEY ("textbookId") REFERENCES "Course"("textbookId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_bookVersionId_fkey" FOREIGN KEY ("bookVersionId") REFERENCES "BookVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "MemberLevel"("userLevel") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_textbookId_fkey" FOREIGN KEY ("textbookId") REFERENCES "Course"("textbookId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Menu" ADD CONSTRAINT "Menu_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Menu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleMenu" ADD CONSTRAINT "RoleMenu_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleMenu" ADD CONSTRAINT "RoleMenu_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_textbookId_fkey" FOREIGN KEY ("textbookId") REFERENCES "Course"("textbookId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Part" ADD CONSTRAINT "Part_unitsId_fkey" FOREIGN KEY ("unitsId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pass" ADD CONSTRAINT "Pass_partsId_fkey" FOREIGN KEY ("partsId") REFERENCES "Part"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pass" ADD CONSTRAINT "Pass_textbookId_fkey" FOREIGN KEY ("textbookId") REFERENCES "Course"("textbookId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_textbookId_fkey" FOREIGN KEY ("textbookId") REFERENCES "Course"("textbookId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionCustomPass" ADD CONSTRAINT "SessionCustomPass_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionCustomPass" ADD CONSTRAINT "SessionCustomPass_customPassId_fkey" FOREIGN KEY ("customPassId") REFERENCES "Pass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_customsPassId_fkey" FOREIGN KEY ("customsPassId") REFERENCES "Pass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SourceMaterial" ADD CONSTRAINT "SourceMaterial_textbookId_fkey" FOREIGN KEY ("textbookId") REFERENCES "Course"("textbookId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberInvite" ADD CONSTRAINT "MemberInvite_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberInvite" ADD CONSTRAINT "MemberInvite_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningRecord" ADD CONSTRAINT "LearningRecord_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningRecord" ADD CONSTRAINT "LearningRecord_textbookId_fkey" FOREIGN KEY ("textbookId") REFERENCES "Course"("textbookId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningRecord" ADD CONSTRAINT "LearningRecord_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningRecord" ADD CONSTRAINT "LearningRecord_partId_fkey" FOREIGN KEY ("partId") REFERENCES "Part"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LearningRecord" ADD CONSTRAINT "LearningRecord_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

