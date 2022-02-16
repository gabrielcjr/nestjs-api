import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Associate } from 'src/associates/entities/associate.entity';
import { Project } from 'src/projects/entities/project.entity';
import { EntityNotFoundError, Repository } from 'typeorm';
import { CreateExecutionDto } from './dto/create-execution.dto';
import { UpdateExecutionDto } from './dto/update-execution.dto';
import { Execution } from './entities/execution.entity';

@Injectable()
export class ExecutionsService {
  constructor(
    @InjectRepository(Execution)
    private executionRepo: Repository<Execution>,

    @InjectRepository(Associate)
    private associateRepo: Repository<Associate>,

    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
  ) {}

  async create(createExecutionDto: CreateExecutionDto) {
    try {
      console.log('teste_create1');
      await this.associateExists(createExecutionDto.associateId);
      await this.projectExists(createExecutionDto.projectId);
      await this.checkDbFim(createExecutionDto, createExecutionDto.associateId);
      console.log('teste_create2');
      const execution = this.executionRepo.create(createExecutionDto);
      console.log('teste_create3');
      return this.executionRepo.save(execution);
    } catch (err) {
      throw err;
    }
  }

  findAll() {
    return this.executionRepo.find();
  }

  findOne(id: number) {
    return this.executionRepo.findOne(id);
  }

  async update(id: number, updateExecutionDto: UpdateExecutionDto) {
    const updateResult = await this.executionRepo.update(
      id,
      updateExecutionDto,
    );
    if (!updateResult.affected) {
      throw new EntityNotFoundError(Execution, id + 'Associate not found');
    }
    return this.executionRepo.findOne(id);
  }

  async remove(id: number) {
    const deleteResult = await this.executionRepo.delete(id);
    if (!deleteResult.affected) {
      throw new EntityNotFoundError(Execution, id + 'Associate not found');
    }
  }

  private async associateExists(id: number) {
    const associate = await this.associateRepo.findOne(id);
    if (typeof associate === 'undefined' || associate.Ativo === false) {
      console.log('teste_associateExists');
      throw new EntityNotFoundError(Associate, id + ' Associate not found');
    }
  }

  private async projectExists(id: number) {
    const project = await this.projectRepo.findOne(id);
    if (!project) {
      console.log('teste_projectExists');
      throw new EntityNotFoundError(Project, id + ' Project not found');
    }
  }

  private async checkDbFim(
    createExecutionDto: CreateExecutionDto,
    associateId: number,
  ) {
    const convertedInputInicio = new Date(createExecutionDto.Inicio);
    const allAssociateIdInDb = await this.executionRepo.find({
      where: { associateId: associateId },
    });
    const allDbFim = allAssociateIdInDb.map((execution) => execution.Fim);
    const maxDateDbFim = new Date(Math.max.apply(null, allDbFim));
    if (convertedInputInicio.getTime() <= maxDateDbFim.getTime()) {
      console.log('teste_checkDB');
      throw new EntityNotFoundError(
        Execution,
        +'Inicio must be greater than any other Fim',
      );
    }
  }
}
