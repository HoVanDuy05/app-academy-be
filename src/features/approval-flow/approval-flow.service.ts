import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException
} from '@nestjs/common';
import { PrismaService } from '../../shared/prisma/prisma.service';
import {
  WorkflowStatus,
  StepRuleType,
  SessionStatus,
  SessionStepStatus,
  ApprovalAction,
  ApproverType
} from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ApprovalFlowService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) { }

  // ==================== WORKFLOW CATEGORIES ====================
  async getCategories() {
    return this.prisma.workflowCategory.findMany({
      include: {
        _count: {
          select: { workflows: true },
        },
      },
    });
  }

  async createCategory(data: { name: string; description?: string }) {
    return this.prisma.workflowCategory.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }

  // ==================== WORKFLOWS ====================
  async getWorkflows(categoryId?: number) {
    const where = categoryId ? { categoryId } : {};
    return this.prisma.workflow.findMany({
      where,
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        _count: {
          select: { steps: true, sessions: true },
        },
      },
    });
  }

  async getWorkflowDetail(id: number) {
    const workflow = await this.prisma.workflow.findUnique({
      where: { id },
      include: {
        category: true,
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        steps: {
          orderBy: { stepOrder: 'asc' },
          include: {
            approvers: {
              include: {
                step: true,
              },
            },
          },
        },
        formFields: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    return workflow;
  }

  async createWorkflow(userId: number, data: any) {
    const workflow = await this.prisma.workflow.create({
      data: {
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        status: WorkflowStatus.DRAFT,
        creatorId: userId,
      },
    });

    // Create steps if any
    if (data.steps && data.steps.length > 0) {
      for (let i = 0; i < data.steps.length; i++) {
        const step = data.steps[i];
        await this.prisma.workflowStep.create({
          data: {
            workflowId: workflow.id,
            stepOrder: i + 1,
            name: step.name || `Step ${i + 1}`,
            ruleType: step.ruleType === 'ALL' ? StepRuleType.ALL : StepRuleType.ANY,
          },
        });
      }
    }

    // Create form fields if any
    if (data.formFields && data.formFields.length > 0) {
      for (let i = 0; i < data.formFields.length; i++) {
        const field = data.formFields[i];
        await this.prisma.workflowFormField.create({
          data: {
            workflowId: workflow.id,
            fieldName: field.fieldName,
            label: field.label,
            type: field.type,
            isRequired: field.isRequired || false,
            options: field.options,
            order: i + 1,
          },
        });
      }
    }

    return this.getWorkflowDetail(workflow.id);
  }

  async updateWorkflow(id: number, data: any) {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.status !== undefined) {
      updateData.status = data.status.toUpperCase() as WorkflowStatus;
    }

    return this.prisma.workflow.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteWorkflow(id: number) {
    return this.prisma.workflow.delete({
      where: { id },
    });
  }

  // ==================== WORKFLOW STEPS ====================
  async addWorkflowStep(workflowId: number, data: any) {
    // Get highest step order
    const lastStep = await this.prisma.workflowStep.findFirst({
      where: { workflowId },
      orderBy: { stepOrder: 'desc' },
    });

    const stepOrder = lastStep ? lastStep.stepOrder + 1 : 1;

    return this.prisma.workflowStep.create({
      data: {
        workflowId,
        stepOrder,
        name: data.name,
        ruleType: data.ruleType === 'ALL' ? StepRuleType.ALL : StepRuleType.ANY,
      },
    });
  }

  async addStepApprover(stepId: number, data: any) {
    return this.prisma.stepApprover.create({
      data: {
        stepId,
        approverType: data.approverType as ApproverType,
        approverId: data.approverId,
        approverRole: data.approverRole,
      },
    });
  }

  // ==================== SESSIONS ====================
  async getSessions(workflowId?: number, creatorId?: number) {
    const where: any = {};
    if (workflowId) where.workflowId = workflowId;
    if (creatorId) where.creatorId = creatorId;

    return this.prisma.workflowSession.findMany({
      where,
      include: {
        workflow: true,
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        sessionSteps: {
          include: {
            step: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSessionDetail(id: number) {
    const session = await this.prisma.workflowSession.findUnique({
      where: { id },
      include: {
        workflow: {
          include: {
            steps: {
              orderBy: { stepOrder: 'asc' },
              include: {
                approvers: true,
              },
            },
            formFields: {
              orderBy: { order: 'asc' },
            },
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        sessionSteps: {
          include: {
            step: true,
          },
          orderBy: {
            step: {
              stepOrder: 'asc',
            },
          },
        },
        approvalLogs: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return session;
  }

  async createWorkflowSession(userId: number, data: any) {
    // Get workflow info
    const workflow = await this.prisma.workflow.findUnique({
      where: { id: data.workflowId },
      include: {
        steps: {
          orderBy: { stepOrder: 'asc' },
        },
      },
    });

    if (!workflow) {
      throw new NotFoundException('Workflow not found');
    }

    if (workflow.status !== WorkflowStatus.ACTIVE) {
      throw new BadRequestException('Workflow is not active');
    }

    // Create session
    const session = await this.prisma.workflowSession.create({
      data: {
        workflowId: data.workflowId,
        formData: data.formData ? JSON.stringify(data.formData) : null,
        status: SessionStatus.PENDING,
        currentStep: 1,
        creatorId: userId,
      },
    });

    // Create session steps from workflow steps
    for (const step of workflow.steps) {
      await this.prisma.sessionStep.create({
        data: {
          sessionId: session.id,
          stepId: step.id,
          status: step.stepOrder === 1 ? SessionStepStatus.PENDING : SessionStepStatus.SKIPPED,
        },
      });
    }

    // Notify first step approvers
    const firstStep = workflow.steps[0];
    if (firstStep) {
      const approvers = await this.prisma.stepApprover.findMany({
        where: { stepId: firstStep.id },
      });

      for (const approver of approvers) {
        if (approver.approverId) {
          await this.notificationsService.createNotification({
            recipientId: approver.approverId,
            title: 'New Approval Request',
            content: `You have a new approval request: "${workflow.name}"`,
            type: 'APPROVE',
            link: `/approvals/session/${session.id}`,
          });
        }
      }
    }

    return this.getSessionDetail(session.id);
  }

  async processSessionStep(sessionId: number, stepId: number, userId: number, data: {
    action: string;
    content?: string;
  }) {
    const session = await this.prisma.workflowSession.findUnique({
      where: { id: sessionId },
      include: {
        workflow: {
          include: {
            steps: {
              orderBy: { stepOrder: 'asc' },
            },
          },
        },
        sessionSteps: {
          include: {
            step: true,
          },
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    // Update session step status
    const action = data.action.toUpperCase() as ApprovalAction;
    let stepStatus: SessionStepStatus;

    switch (action) {
      case ApprovalAction.APPROVE:
        stepStatus = SessionStepStatus.APPROVED;
        break;
      case ApprovalAction.REJECT:
        stepStatus = SessionStepStatus.REJECTED;
        break;
      default:
        throw new BadRequestException('Invalid action');
    }

    // Update step
    await this.prisma.sessionStep.updateMany({
      where: { sessionId, stepId },
      data: {
        status: stepStatus,
        approverId: userId,
        approvedAt: new Date(),
      },
    });

    // Add to logs
    await this.prisma.workflowApprovalLog.create({
      data: {
        sessionId,
        stepId,
        userId,
        action,
        content: data.content,
      },
    });

    // Handle next step or finish
    const currentStepIndex = session.workflow.steps.findIndex((b: { id: number }) => b.id === stepId);
    const nextStep = session.workflow.steps[currentStepIndex + 1];

    if (action === ApprovalAction.REJECT) {
      // Reject -> end session
      await this.prisma.workflowSession.update({
        where: { id: sessionId },
        data: { status: SessionStatus.REJECTED },
      });

      // Notify creator
      await this.notificationsService.createNotification({
        recipientId: session.creatorId,
        title: 'Request Rejected',
        content: `Your request "${session.workflow.name}" has been rejected`,
        type: 'APPROVE',
        link: `/approvals/session/${sessionId}`,
      });
    } else if (action === ApprovalAction.APPROVE) {
      if (nextStep) {
        // Update current step and activate next step
        await this.prisma.workflowSession.update({
          where: { id: sessionId },
          data: { currentStep: nextStep.stepOrder },
        });

        // Activate next step
        await this.prisma.sessionStep.updateMany({
          where: { sessionId, stepId: nextStep.id },
          data: { status: SessionStepStatus.PENDING },
        });

        // Notify next step approvers
        const nextApprovers = await this.prisma.stepApprover.findMany({
          where: { stepId: nextStep.id },
        });

        for (const approver of nextApprovers) {
          if (approver.approverId) {
            await this.notificationsService.createNotification({
              recipientId: approver.approverId,
              title: 'New Approval Request',
              content: `You have a new approval request: "${session.workflow.name}"`,
              type: 'APPROVE',
              link: `/approvals/session/${sessionId}`,
            });
          }
        }
      } else {
        // Finish session
        await this.prisma.workflowSession.update({
          where: { id: sessionId },
          data: { status: SessionStatus.APPROVED },
        });

        // Notify creator
        await this.notificationsService.createNotification({
          recipientId: session.creatorId,
          title: 'Request Approved',
          content: `Your request "${session.workflow.name}" has been approved`,
          type: 'APPROVE',
          link: `/approvals/session/${sessionId}`,
        });
      }
    }

    return this.getSessionDetail(sessionId);
  }

  async getPendingSessions(userId: number) {
    // Get steps where user has approval rights
    const stepIds = await this.prisma.stepApprover.findMany({
      where: {
        OR: [
          { approverId: userId },
          { approverType: ApproverType.ROLE },
        ],
      },
      select: { stepId: true },
    });

    const stepIdList = stepIds.map((b: { stepId: number }) => b.stepId);

    // Get processing sessions at these steps
    return this.prisma.workflowSession.findMany({
      where: {
        status: SessionStatus.PROCESSING,
        sessionSteps: {
          some: {
            stepId: { in: stepIdList },
            status: SessionStepStatus.PENDING,
          },
        },
      },
      include: {
        workflow: true,
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
          },
        },
        sessionSteps: {
          include: {
            step: true,
          },
        },
      },
    });
  }
}
