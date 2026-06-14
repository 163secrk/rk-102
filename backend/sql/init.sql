-- =====================================================
-- 灵脉 SpiritLink 数据库初始化脚本
-- 珍稀绿植宠物谱系与溯源系统
-- =====================================================

CREATE DATABASE IF NOT EXISTS `spiritlink`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `spiritlink`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 1. 用户表 users
-- =====================================================
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` CHAR(36) NOT NULL COMMENT '用户ID(UUID)',
  `username` VARCHAR(50) NOT NULL COMMENT '用户名',
  `email` VARCHAR(100) NOT NULL COMMENT '邮箱',
  `phone` VARCHAR(20) NULL COMMENT '手机号',
  `password` VARCHAR(255) NOT NULL COMMENT '密码(bcrypt)',
  `nickname` VARCHAR(50) NULL COMMENT '昵称',
  `avatar` VARCHAR(500) NULL COMMENT '头像URL',
  `role` ENUM('super_admin','admin','breeder','owner','verifier','guest') NOT NULL DEFAULT 'guest' COMMENT '角色',
  `status` ENUM('pending','active','disabled','banned') NOT NULL DEFAULT 'pending' COMMENT '状态',
  `emailVerified` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '邮箱是否验证',
  `phoneVerified` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '手机是否验证',
  `lastLoginIp` VARCHAR(255) NULL COMMENT '最后登录IP',
  `lastLoginAt` DATETIME NULL COMMENT '最后登录时间',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  UNIQUE KEY `uk_email` (`email`),
  UNIQUE KEY `uk_phone` (`phone`),
  KEY `idx_role` (`role`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 插入一个测试管理员 (密码: Asd123456)
INSERT INTO `users` (`id`, `username`, `email`, `phone`, `password`, `nickname`, `avatar`, `role`, `status`, `emailVerified`, `phoneVerified`) VALUES
(UUID(), 'admin', 'admin@spiritlink.com', '13800000000',
 '$2b$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW',
 '超级管理员', NULL, 'super_admin', 'active', 1, 1);

-- =====================================================
-- 2. 育种者/机构认证表 breeders
-- =====================================================
DROP TABLE IF EXISTS `breeders`;
CREATE TABLE `breeders` (
  `id` CHAR(36) NOT NULL COMMENT '认证ID',
  `userId` CHAR(36) NULL COMMENT '关联用户ID',
  `type` ENUM('individual','company','organization','research_institute') NOT NULL COMMENT '类型',
  `realName` VARCHAR(100) NOT NULL COMMENT '真实姓名',
  `idCardNumber` VARCHAR(30) NULL COMMENT '身份证号',
  `companyName` VARCHAR(100) NULL COMMENT '公司/机构名称',
  `businessLicense` VARCHAR(50) NULL COMMENT '营业执照号',
  `address` VARCHAR(200) NULL COMMENT '地址',
  `contactPhone` VARCHAR(20) NULL COMMENT '联系电话',
  `description` VARCHAR(500) NULL COMMENT '简介',
  `credentials` TEXT NULL COMMENT '资质文件JSON',
  `status` ENUM('pending','under_review','approved','rejected','suspended') NOT NULL DEFAULT 'pending' COMMENT '审核状态',
  `certificationNumber` VARCHAR(100) NULL COMMENT '认证编号',
  `certifiedAt` DATETIME NULL COMMENT '认证通过时间',
  `reviewedAt` DATETIME NULL COMMENT '审核处理时间',
  `reviewNote` VARCHAR(255) NULL COMMENT '审核备注',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_userId` (`userId`),
  UNIQUE KEY `uk_idCard` (`idCardNumber`),
  UNIQUE KEY `uk_license` (`businessLicense`),
  KEY `idx_status` (`status`),
  KEY `idx_type` (`type`),
  CONSTRAINT `fk_breeder_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='育种者/机构认证表';

-- =====================================================
-- 3. 生物个体数字档案表 organisms
-- =====================================================
DROP TABLE IF EXISTS `organisms`;
CREATE TABLE `organisms` (
  `id` CHAR(36) NOT NULL COMMENT '个体ID',
  `code` VARCHAR(50) NOT NULL COMMENT '个体唯一编号',
  `name` VARCHAR(100) NOT NULL COMMENT '个体名称',
  `category` ENUM('plant','pet','hybrid') NOT NULL COMMENT '类别：植物/宠物/杂交',
  `species` VARCHAR(100) NOT NULL COMMENT '物种',
  `subspecies` VARCHAR(100) NULL COMMENT '亚种',
  `variety` VARCHAR(100) NULL COMMENT '品种',
  `gender` ENUM('male','female','hermaphrodite','unknown') NOT NULL DEFAULT 'unknown' COMMENT '性别',
  `birthDate` DATE NULL COMMENT '出生日期',
  `birthWeight` DECIMAL(10,2) NULL COMMENT '出生体重(g)',
  `birthPlace` VARCHAR(100) NULL COMMENT '出生地',
  `appearance` TEXT NULL COMMENT '外观描述',
  `traits` TEXT NULL COMMENT '特征性状',
  `genetics` TEXT NULL COMMENT '基因信息',
  `images` TEXT NULL COMMENT '图片数组(逗号分隔JSON)',
  `coverImage` VARCHAR(500) NULL COMMENT '封面图',
  `estimatedValue` DECIMAL(12,2) NULL COMMENT '估值',
  `status` ENUM('alive','dead','missing','sold','donated') NOT NULL DEFAULT 'alive' COMMENT '状态',
  `chipNumber` TEXT NULL COMMENT '芯片/标签号',
  `dnaSample` VARCHAR(100) NULL COMMENT 'DNA样本编号',
  `breederId` CHAR(36) NULL COMMENT '育种者ID',
  `ownerId` CHAR(36) NULL COMMENT '当前所有者ID',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_category` (`category`),
  KEY `idx_species` (`species`),
  KEY `idx_status` (`status`),
  KEY `idx_breeder` (`breederId`),
  KEY `idx_owner` (`ownerId`),
  KEY `idx_birthDate` (`birthDate`),
  CONSTRAINT `fk_organism_breeder` FOREIGN KEY (`breederId`) REFERENCES `breeders` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_organism_owner` FOREIGN KEY (`ownerId`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='生物个体数字档案表';

-- =====================================================
-- 4. 谱系关系表 pedigrees (无限层级)
-- =====================================================
DROP TABLE IF EXISTS `pedigrees`;
CREATE TABLE `pedigrees` (
  `id` CHAR(36) NOT NULL COMMENT '谱系关系ID',
  `organismId` CHAR(36) NOT NULL COMMENT '本个体ID',
  `relatedOrganismId` CHAR(36) NULL COMMENT '关联个体ID',
  `relation` ENUM('father','mother','child','sibling','grandparent','grandchild','clone','graft') NOT NULL COMMENT '关系类型',
  `generation` INT NOT NULL DEFAULT 1 COMMENT '代数',
  `note` TEXT NULL COMMENT '备注',
  `confirmed` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否经DNA确认',
  `dnaVerification` VARCHAR(100) NULL COMMENT 'DNA验证凭证',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_organism` (`organismId`),
  KEY `idx_related` (`relatedOrganismId`),
  KEY `idx_relation` (`relation`),
  KEY `idx_generation` (`generation`),
  CONSTRAINT `fk_pedigree_self` FOREIGN KEY (`organismId`) REFERENCES `organisms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pedigree_related` FOREIGN KEY (`relatedOrganismId`) REFERENCES `organisms` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='谱系关系表(无限层级)';

-- =====================================================
-- 5. 溯源二维码表 trace_codes
-- =====================================================
DROP TABLE IF EXISTS `trace_codes`;
CREATE TABLE `trace_codes` (
  `id` CHAR(36) NOT NULL COMMENT '溯源码ID',
  `organismId` CHAR(36) NOT NULL COMMENT '关联个体ID',
  `code` VARCHAR(100) NOT NULL COMMENT '溯源唯一码',
  `qrData` TEXT NOT NULL COMMENT '二维码原始数据(JSON)',
  `qrImage` MEDIUMTEXT NOT NULL COMMENT '二维码图片(Base64或URL)',
  `payload` JSON NULL COMMENT '扩展载荷数据',
  `scanCount` INT NOT NULL DEFAULT 0 COMMENT '扫码次数',
  `lastScanAt` DATETIME NULL COMMENT '最后扫码时间',
  `lastScanIp` VARCHAR(45) NULL COMMENT '最后扫码IP',
  `active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否有效',
  `expiresAt` DATETIME NULL COMMENT '过期时间',
  `createdById` CHAR(36) NULL COMMENT '创建人ID',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_organism` (`organismId`),
  KEY `idx_active` (`active`),
  KEY `idx_createdBy` (`createdById`),
  CONSTRAINT `fk_trace_organism` FOREIGN KEY (`organismId`) REFERENCES `organisms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_trace_creator` FOREIGN KEY (`createdById`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='溯源二维码表';

-- =====================================================
-- 6. 成长健康日志表 health_logs
-- =====================================================
DROP TABLE IF EXISTS `health_logs`;
CREATE TABLE `health_logs` (
  `id` CHAR(36) NOT NULL COMMENT '日志ID',
  `organismId` CHAR(36) NOT NULL COMMENT '关联个体ID',
  `type` ENUM('checkup','vaccination','treatment','feeding','grooming','watering','fertilizing','reproduction','transplant','accident','other') NOT NULL COMMENT '日志类型',
  `healthStatus` ENUM('excellent','good','fair','poor','critical') NOT NULL DEFAULT 'good' COMMENT '健康状态',
  `logDate` DATETIME NOT NULL COMMENT '日志日期',
  `title` TEXT NOT NULL COMMENT '日志标题',
  `description` TEXT NULL COMMENT '详细描述',
  `temperature` DECIMAL(10,2) NULL COMMENT '体温(℃)',
  `weight` DECIMAL(10,2) NULL COMMENT '体重(g)',
  `height` DECIMAL(10,2) NULL COMMENT '高度/身长(cm)',
  `symptoms` TEXT NULL COMMENT '症状(逗号分隔)',
  `diagnosis` TEXT NULL COMMENT '诊断',
  `prescription` TEXT NULL COMMENT '处方/用药',
  `attachments` TEXT NULL COMMENT '附件(逗号分隔)',
  `createdById` CHAR(36) NULL COMMENT '记录人ID',
  `veterinarian` VARCHAR(100) NULL COMMENT '兽医/负责人',
  `location` VARCHAR(100) NULL COMMENT '记录地点',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_organism` (`organismId`),
  KEY `idx_type` (`type`),
  KEY `idx_healthStatus` (`healthStatus`),
  KEY `idx_logDate` (`logDate`),
  KEY `idx_createdBy` (`createdById`),
  CONSTRAINT `fk_health_organism` FOREIGN KEY (`organismId`) REFERENCES `organisms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_health_creator` FOREIGN KEY (`createdById`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成长健康日志表';

-- =====================================================
-- 7. 所有权安全转移表 ownership_transfers
-- =====================================================
DROP TABLE IF EXISTS `ownership_transfers`;
CREATE TABLE `ownership_transfers` (
  `id` CHAR(36) NOT NULL COMMENT '转移ID',
  `organismId` CHAR(36) NOT NULL COMMENT '个体ID',
  `fromUserId` CHAR(36) NOT NULL COMMENT '转出方ID',
  `toUserId` CHAR(36) NOT NULL COMMENT '转入方ID',
  `status` ENUM('pending','awaiting_confirm','completed','cancelled','rejected','disputed') NOT NULL DEFAULT 'pending' COMMENT '状态',
  `transferType` VARCHAR(50) NULL COMMENT '转移类型(买卖/赠送/继承)',
  `price` DECIMAL(12,2) NULL COMMENT '交易价格',
  `currency` VARCHAR(50) NULL DEFAULT 'CNY' COMMENT '币种',
  `reason` TEXT NULL COMMENT '转移原因',
  `contract` TEXT NULL COMMENT '合同内容/哈希',
  `documents` TEXT NULL COMMENT '附件文件(逗号分隔)',
  `transactionHash` VARCHAR(100) NULL COMMENT '区块链交易哈希',
  `signFrom` VARCHAR(100) NULL COMMENT '转出方签名',
  `signTo` VARCHAR(100) NULL COMMENT '转入方签名',
  `signedAtFrom` DATETIME NULL COMMENT '转出方签名时间',
  `signedAtTo` DATETIME NULL COMMENT '转入方签名时间',
  `completedAt` DATETIME NULL COMMENT '完成时间',
  `witnessId` CHAR(36) NULL COMMENT '见证人ID',
  `rejectReason` TEXT NULL COMMENT '拒绝原因',
  `rejectedAt` DATETIME NULL COMMENT '拒绝时间',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_organism` (`organismId`),
  KEY `idx_from` (`fromUserId`),
  KEY `idx_to` (`toUserId`),
  KEY `idx_status` (`status`),
  KEY `idx_witness` (`witnessId`),
  KEY `idx_createdAt` (`createdAt`),
  CONSTRAINT `fk_transfer_organism` FOREIGN KEY (`organismId`) REFERENCES `organisms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_transfer_from` FOREIGN KEY (`fromUserId`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_transfer_to` FOREIGN KEY (`toUserId`) REFERENCES `users` (`id`),
  CONSTRAINT `fk_transfer_witness` FOREIGN KEY (`witnessId`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='所有权安全转移表';

-- =====================================================
-- 8. 预警与日程调度表 alerts
-- =====================================================
DROP TABLE IF EXISTS `alerts`;
CREATE TABLE `alerts` (
  `id` CHAR(36) NOT NULL COMMENT '预警ID',
  `userId` CHAR(36) NOT NULL COMMENT '所属用户ID',
  `organismId` CHAR(36) NULL COMMENT '关联个体ID',
  `type` ENUM('vaccination','feeding','watering','grooming','health_check','reproduction','birthday','ownership','certification','system','custom') NOT NULL DEFAULT 'custom' COMMENT '类型',
  `level` ENUM('info','warning','danger','critical') NOT NULL DEFAULT 'info' COMMENT '紧急级别',
  `status` ENUM('pending','notified','acknowledged','completed','overdue','cancelled') NOT NULL DEFAULT 'pending' COMMENT '状态',
  `title` VARCHAR(200) NOT NULL COMMENT '标题',
  `description` TEXT NULL COMMENT '描述',
  `scheduledAt` DATETIME NOT NULL COMMENT '计划时间',
  `remindBeforeMinutes` INT NOT NULL DEFAULT 0 COMMENT '提前多少分钟提醒',
  `repeat` ENUM('none','daily','weekly','monthly','yearly','custom') NOT NULL DEFAULT 'none' COMMENT '重复周期',
  `customRepeatDays` INT NULL COMMENT '自定义重复天数',
  `repeatEndDate` DATETIME NULL COMMENT '重复结束日期',
  `notifyCount` INT NOT NULL DEFAULT 0 COMMENT '通知次数',
  `lastNotifiedAt` DATETIME NULL COMMENT '最后通知时间',
  `acknowledgedAt` DATETIME NULL COMMENT '确认时间',
  `completedAt` DATETIME NULL COMMENT '完成时间',
  `acknowledgedById` CHAR(36) NULL COMMENT '确认人ID',
  `pushNotification` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否推送通知',
  `emailNotification` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否邮件通知',
  `smsNotification` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否短信通知',
  `meta` TEXT NULL COMMENT '扩展元数据JSON',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user` (`userId`),
  KEY `idx_organism` (`organismId`),
  KEY `idx_type` (`type`),
  KEY `idx_level` (`level`),
  KEY `idx_status` (`status`),
  KEY `idx_scheduled` (`scheduledAt`),
  CONSTRAINT `fk_alert_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_alert_organism` FOREIGN KEY (`organismId`) REFERENCES `organisms` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_alert_ack` FOREIGN KEY (`acknowledgedById`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='预警与日程调度表';

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- 完成信息
-- =====================================================
SELECT '=== 灵脉 SpiritLink 数据库初始化完成 ===' AS status;
SELECT
  (SELECT COUNT(*) FROM users) AS users_count,
  (SELECT COUNT(*) FROM breeders) AS breeders_count,
  (SELECT COUNT(*) FROM organisms) AS organisms_count,
  (SELECT COUNT(*) FROM pedigrees) AS pedigrees_count,
  (SELECT COUNT(*) FROM trace_codes) AS trace_codes_count,
  (SELECT COUNT(*) FROM health_logs) AS health_logs_count,
  (SELECT COUNT(*) FROM ownership_transfers) AS transfers_count,
  (SELECT COUNT(*) FROM alerts) AS alerts_count;
