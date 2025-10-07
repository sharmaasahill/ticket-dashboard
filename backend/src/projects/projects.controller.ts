import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { ProjectsService } from './projects.service';

class CreateProjectDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

class UpdateProjectDto {
  @IsOptional()
  @IsString()
  name?: string;
  
  @IsOptional()
  @IsString()
  description?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  list() {
    return this.projects.list();
  }

  @Post()
  async create(@Body() dto: CreateProjectDto) {
    return this.projects.create(dto);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.projects.getById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projects.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    try {
      const result = await this.projects.delete(id);
      return { success: true, data: result };
    } catch (error) {
      console.error('Delete project error:', error);
      throw error;
    }
  }
}


