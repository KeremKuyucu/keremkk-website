
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

type ProjectConfig = {
    id: string;
    url: string;
    key: string;
};

export async function GET(req: NextRequest) {
    try {
        // 1. Try to get projects from environment variable (JSON array)
        const envProjects = process.env.SUPABASE_MONITOR_PROJECTS;
        let projects: ProjectConfig[] = [];

        if (envProjects) {
            try {
                projects = JSON.parse(envProjects);
            } catch (e) {
                console.error('Failed to parse SUPABASE_MONITOR_PROJECTS env var', e);
            }
        }
        if (projects.length === 0) {
            return NextResponse.json(
                {
                    error: 'No projects configured. Please set SUPABASE_MONITOR_PROJECTS environment variable with a JSON array of projects, or set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
                },
                { status: 500 }
            );
        }

        const results = await Promise.all(
            projects.map(async (project) => {
                try {
                    const supabase = createClient(project.url, project.key, {
                        auth: {
                            persistSession: false,
                            autoRefreshToken: false,
                            detectSessionInUrl: false,
                        },
                    });

                    const start = Date.now();
                    const { data, error } = await supabase.rpc('healthcheck');
                    const duration = Date.now() - start;

                    if (error) {
                        return {
                            id: project.id,
                            status: 'error',
                            error: error.message,
                            duration,
                            server_time: new Date().toISOString(),
                        };
                    }

                    return {
                        id: project.id,
                        status: 'ok',
                        data,
                        duration,
                        server_time: new Date().toISOString(),
                    };
                } catch (err: any) {
                    return {
                        id: project.id,
                        status: 'error',
                        error: err.message || 'Unknown error',
                        server_time: new Date().toISOString(),
                    };
                }
            })
        );

        return NextResponse.json({ results });
    } catch (error) {
        console.error('Monitor API Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}