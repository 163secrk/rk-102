import { IsString, IsEmail, MinLength, MaxLength, IsOptional, IsPhoneNumber, Matches, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BreederType } from '../../entities/breeder.entity';

export enum RegisterAccountType {
  GUEST = 'guest',
  BREEDER = 'breeder',
}

export class RegisterDto {
  @ApiProperty({ description: '用户名', example: 'spiritlink_user' })
  @IsString()
  @MinLength(4, { message: '用户名至少4个字符' })
  @MaxLength(50, { message: '用户名最多50个字符' })
  @Matches(/^[a-zA-Z0-9_]+$/, { message: '用户名只能包含字母、数字和下划线' })
  username: string;

  @ApiProperty({ description: '邮箱', example: 'user@spiritlink.com' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  @MaxLength(100)
  email: string;

  @ApiPropertyOptional({ description: '手机号', example: '13800138000' })
  @IsOptional()
  @IsPhoneNumber('CN', { message: '请输入有效的手机号' })
  phone?: string;

  @ApiProperty({ description: '密码', example: 'Asd123456' })
  @IsString()
  @MinLength(8, { message: '密码至少8个字符' })
  @MaxLength(50, { message: '密码最多50个字符' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: '密码必须包含大小写字母和数字',
  })
  password: string;

  @ApiPropertyOptional({ description: '昵称', example: '灵脉守护者' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  nickname?: string;

  @ApiProperty({ description: '注册账户类型', enum: RegisterAccountType, example: RegisterAccountType.BREEDER })
  @IsEnum(RegisterAccountType, { message: '请选择有效的账户类型' })
  accountType: RegisterAccountType;
}

export class BreederRegisterDto extends RegisterDto {
  @ApiProperty({ description: '育种者类型', enum: BreederType, example: BreederType.INDIVIDUAL })
  @IsEnum(BreederType, { message: '请选择有效的育种者类型' })
  breederType: BreederType;

  @ApiProperty({ description: '真实姓名/企业法人姓名', example: '张三' })
  @IsString()
  @IsNotEmpty({ message: '请输入真实姓名' })
  @MaxLength(100, { message: '姓名最多100个字符' })
  realName: string;

  @ApiPropertyOptional({ description: '身份证号（个人育种者必填）', example: '110101199001011234' })
  @IsOptional()
  @IsString()
  @Matches(/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/, {
    message: '请输入有效的身份证号',
  })
  idCardNumber?: string;

  @ApiPropertyOptional({ description: '企业/基地名称（企业/机构必填）', example: '绿野育种基地' })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '企业名称最多100个字符' })
  companyName?: string;

  @ApiPropertyOptional({ description: '营业执照编号（企业/机构必填）', example: '91110000MA00ABC123' })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '营业执照编号最多50个字符' })
  businessLicense?: string;

  @ApiPropertyOptional({ description: '联系地址', example: '北京市海淀区中关村大街1号' })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: '地址最多200个字符' })
  address?: string;

  @ApiPropertyOptional({ description: '联系电话', example: '13800138000' })
  @IsOptional()
  @IsPhoneNumber('CN', { message: '请输入有效的联系电话' })
  contactPhone?: string;

  @ApiPropertyOptional({ description: '育种者简介', example: '专注于多肉植物育种10年，拥有丰富的杂交育种经验' })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '简介最多500个字符' })
  description?: string;

  @ApiPropertyOptional({ description: '资质证明文件URL（身份证照片、营业执照扫描件等）', example: '["/uploads/credentials/xxx.jpg"]' })
  @IsOptional()
  @IsString()
  credentials?: string;
}

export class LoginDto {
  @ApiProperty({ description: '用户名/邮箱/手机号', example: 'spiritlink_user' })
  @IsString()
  account: string;

  @ApiProperty({ description: '密码', example: 'Asd123456' })
  @IsString()
  password: string;
}

export class ReviewBreederDto {
  @ApiProperty({ description: '审核备注', example: '资质材料齐全，符合要求' })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: '审核备注最多255个字符' })
  reviewNote?: string;
}
