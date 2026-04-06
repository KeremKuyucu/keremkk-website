import { NextResponse } from 'next/server';

interface GitHubRepoData {
    archived: boolean;
    pushed_at: string;
    stargazers_count: number;
    forks_count: number;
    language: string | null;
    private: boolean;
    open_issues_count: number;
    watchers_count: number;
    description: string | null;
}

interface RepoInfo {
    lastCommit: string;
    isArchived: boolean;
    stars: number;
    forks: number;
    language: string | null;
    isPrivate: boolean;
    openIssues: number;
    watchers: number;
    description: string | null;
}

// Not: next: { revalidate: 3600 } ile Next.js Data Cache kullanılıyor,
// serverless'ta in-memory Map çalışmadığı için kaldırıldı.

function getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffWeeks = Math.floor(diffDays / 7);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffYears > 0) return `${diffYears} yıl önce`;
    if (diffMonths > 0) return `${diffMonths} ay önce`;
    if (diffWeeks > 0) return `${diffWeeks} hafta önce`;
    if (diffDays > 0) return `${diffDays} gün önce`;
    if (diffHours > 0) return `${diffHours} saat önce`;
    if (diffMinutes > 0) return `${diffMinutes} dakika önce`;
    return 'Az önce';
}

export async function GET(request: Request) {
    // Site dışından erişimi engelle
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('host') || '';

    const isAllowed =
        (!origin || origin.includes(host)) &&
        (!referer || referer.includes(host));

    if (!isAllowed) {
        return NextResponse.json({ error: 'Unauthorized access' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const repos = searchParams.get('repos');

    if (!repos) {
        return NextResponse.json({ error: 'No repos provided' }, { status: 400 });
    }

    const repoList = repos.split(',');
    const results: { [key: string]: RepoInfo } = {};

    for (const repo of repoList) {
        try {
            const response = await fetch(`https://api.github.com/repos/${repo}`, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    ...(process.env.GITHUB_TOKEN && { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` }),
                },
                next: { revalidate: 3600 } // Cache for 1 hour via Next.js Data Cache
            });

            if (response.ok) {
                const data: GitHubRepoData = await response.json();
                const repoInfo: RepoInfo = {
                    lastCommit: getRelativeTime(data.pushed_at),
                    isArchived: data.archived,
                    stars: data.stargazers_count,
                    forks: data.forks_count,
                    language: data.language,
                    isPrivate: data.private,
                    openIssues: data.open_issues_count,
                    watchers: data.watchers_count,
                    description: data.description,
                };

                results[repo] = repoInfo;
            } else {
                results[repo] = {
                    lastCommit: 'Bilinmiyor',
                    isArchived: false,
                    stars: 0,
                    forks: 0,
                    language: null,
                    isPrivate: true,
                    openIssues: 0,
                    watchers: 0,
                    description: null
                };
            }
        } catch (error) {
            console.error(`Error fetching ${repo}:`, error);
            results[repo] = {
                lastCommit: 'Bilinmiyor',
                isArchived: false,
                stars: 0,
                forks: 0,
                language: null,
                isPrivate: true,
                openIssues: 0,
                watchers: 0,
                description: null
            };
        }
    }

    return NextResponse.json(results);
}
