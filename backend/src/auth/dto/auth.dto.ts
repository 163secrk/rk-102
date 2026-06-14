import { IsString, IsEmail, MinLength, MaxLength, IsOptional, IsPhoneNumber, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
}

export class LoginDto {
  @ApiProperty({ description: '用户名/邮箱/手机号', example: 'spiritlink_user' })
  @IsString()
  account: string;

  @ApiProperty({ description: '密码', example: 'Asd123456' })
  @IsString()
  password: string;
}
