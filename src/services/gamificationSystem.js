// src/services/gamificationSystem.js
class GamificationSystem {
    constructor() {
        this.achievements = {
            FIRST_REPORT: {
                id: 'FIRST_REPORT',
                title: 'First Steps',
                description: 'Report your first problem',
                points: 100
            },
            QUICK_SOLVER: {
                id: 'QUICK_SOLVER',
                title: 'Quick Solver',
                description: 'Solve a problem within 24 hours',
                points: 200
            },
            ENVIRONMENT_HERO: {
                id: 'ENVIRONMENT_HERO',
                title: 'Environment Hero',
                description: 'Report 10 environmental issues',
                points: 500
            }
            // Add more achievements as needed
        };

        this.levels = [
            { level: 1, pointsRequired: 0, title: 'Beginner' },
            { level: 2, pointsRequired: 500, title: 'Observer' },
            { level: 3, pointsRequired: 1000, title: 'Guardian' },
            { level: 4, pointsRequired: 2500, title: 'Protector' },
            { level: 5, pointsRequired: 5000, title: 'Champion' }
        ];
    }

    async checkAchievements(userId, action) {
        const userStats = await this.getUserStats(userId);
        const newAchievements = [];

        switch (action) {
            case 'REPORT_PROBLEM':
                if (userStats.problemsReported === 1) {
                    newAchievements.push(this.achievements.FIRST_REPORT);
                }
                if (userStats.problemsReported === 10) {
                    newAchievements.push(this.achievements.ENVIRONMENT_HERO);
                }
                break;
            case 'SOLVE_PROBLEM':
                // Check for quick solver achievement
                if (this.isQuickSolution(userStats.lastProblemSolved)) {
                    newAchievements.push(this.achievements.QUICK_SOLVER);
                }
                break;
            // Add more achievement checks
        }

        if (newAchievements.length > 0) {
            await this.awardAchievements(userId, newAchievements);
        }

        return newAchievements;
    }

    async calculateLevel(points) {
        for (let i = this.levels.length - 1; i >= 0; i--) {
            if (points >= this.levels[i].pointsRequired) {
                return this.levels[i];
            }
        }
        return this.levels[0];
    }

    // In-memory cache for active challenges
    activeChallenges = new Map();

    async startChallenge(userId, challengeType) {
        const challenge = {
            id: Date.now(),
            type: challengeType,
            startTime: new Date(),
            targetCount: this.getChallengeTarget(challengeType),
            currentCount: 0
        };

        this.activeChallenges.set(userId, challenge);
        return challenge;
    }

    getChallengeTarget(type) {
        const targets = {
            DAILY_REPORTS: 3,
            WEEKLY_SOLUTIONS: 5,
            MONTHLY_CONTRIBUTIONS: 20
        };
        return targets[type] || 1;
    }

    async updateProgress(userId, action) {
        const challenge = this.activeChallenges.get(userId);
        if (!challenge) return null;

        challenge.currentCount++;
        if (challenge.currentCount >= challenge.targetCount) {
            await this.completeChallenge(userId, challenge);
            this.activeChallenges.delete(userId);
        }

        return challenge;
    }
}

export default new GamificationSystem();
