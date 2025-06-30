"use server";
import { prismaClient } from "@/lib/prismaClient";

interface Project {
  id: string;
  name: string;
  description: string;
  service: string;
  createdAt: string;
  lastModified: string;
}

export async function fetchProjectInformation(
  projectId: string
): Promise<Project> {
  try {
    const project = await prismaClient.project.findFirst({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      service: project.type,
      createdAt: project.createdAt.toISOString().split("T")[0],
      lastModified: project.updatedAt.toISOString().split("T")[0],
    };
  } catch (error) {
    console.error("Failed to fetch project:", error);
    throw new Error("Unable to fetch project");
  }
}
