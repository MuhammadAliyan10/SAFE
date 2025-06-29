"use server";

import { prismaClient } from "@/lib/prismaClient";
import { ProjectType } from "@prisma/client";

interface ProjectFormInputs {
  name: string;
  description: string;
  workingEmail?: string;
  clientEmail?: string;
  documentType?: string;
  generalNote?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  service: string;
  status: "Active" | "Completed" | "Paused" | "Draft";
  createdAt: string;
  lastModified: string;
  progress: number;
}

export async function fetchProjects(userId: string): Promise<Project[]> {
  try {
    const projects = await prismaClient.project.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      service: p.type,
      status: "Draft",
      createdAt: p.createdAt.toISOString().split("T")[0],
      lastModified: p.updatedAt.toISOString().split("T")[0],
      progress: 0,
    }));
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    throw new Error("Unable to fetch projects");
  }
}

export async function createProject(
  data: ProjectFormInputs,
  service: string,
  userId: string
): Promise<Project> {
  try {
    // Validate userId exists
    const user = await prismaClient.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error("Invalid user ID: User does not exist");
    }

    const info: Record<string, string> = {};
    if (service === "BUSINESS_SECURITY") {
      info.workingEmail = data.workingEmail || "";
    } else if (service === "INVOICING") {
      info.clientEmail = data.clientEmail || "";
    } else if (service === "DOCUMENT_SECURITY") {
      info.documentType = data.documentType || "";
    } else if (service === "ALL_SERVICES") {
      info.generalNote = data.generalNote || "";
    }

    const newProject = await prismaClient.project.create({
      data: {
        name: data.name,
        description: data.description,
        type: service as ProjectType,
        info,
        userId,
      },
    });

    return {
      id: newProject.id,
      name: newProject.name,
      description: newProject.description,
      service: newProject.type,
      status: "Draft",
      createdAt: newProject.createdAt.toISOString().split("T")[0],
      lastModified: newProject.updatedAt.toISOString().split("T")[0],
      progress: 0,
    };
  } catch (error) {
    console.error("Failed to create project:", error);
    throw error instanceof Error
      ? error
      : new Error("Unable to create project");
  }
}

export async function deleteProject(projectId: string): Promise<void> {
  try {
    await prismaClient.project.delete({
      where: { id: projectId },
    });
  } catch (error) {
    console.error("Failed to delete project:", error);
    throw new Error("Unable to delete project");
  }
}
