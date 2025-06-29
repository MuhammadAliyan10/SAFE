import { prismaClient } from "@/lib/prismaClient";

interface Project {
  id: string;
  name: string;
  description: string;
  service: string;
  createdAt: string;
  lastModified: string;
  progress: number;
}

export async function fetchProjectInformation(
  projectId: string
): Promise<Project[]> {
  try {
    const projects = await prismaClient.project.findMany({
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
