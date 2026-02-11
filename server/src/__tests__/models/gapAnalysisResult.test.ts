/**
 * Tests for GapAnalysisResult model schema validation
 */

import mongoose from 'mongoose';
import { GapAnalysisResult } from '../../models/gapAnalysisResult.model';

// Use in-memory connection for tests
beforeAll(async () => {
  await mongoose.connect(
    process.env.MONGO_TEST_URI || 'mongodb://127.0.0.1:27017/skillsense_test'
  );
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

afterEach(async () => {
  await GapAnalysisResult.deleteMany({});
});

const validData = () => ({
  userId: new mongoose.Types.ObjectId(),
  targetRole: {
    roleId: new mongoose.Types.ObjectId(),
    title: 'Frontend Developer',
  },
  gaps: [
    {
      skillId: 'js',
      skillName: 'JavaScript',
      currentLevel: 2,
      requiredLevel: 4,
      gapSize: 2,
      priority: 'high' as const,
      importance: 'must_have',
      estimatedTimeToClose: 40,
    },
  ],
  overallReadiness: 65,
  strengthAreas: ['React', 'CSS'],
  improvementAreas: ['JavaScript'],
  analyzedAt: new Date(),
});

describe('GapAnalysisResult Model', () => {
  it('should create and save a valid gap analysis result', async () => {
    const doc = await GapAnalysisResult.create(validData());

    expect(doc._id).toBeDefined();
    expect(doc.userId).toBeDefined();
    expect(doc.targetRole.title).toBe('Frontend Developer');
    expect(doc.gaps).toHaveLength(1);
    expect(doc.gaps[0].skillName).toBe('JavaScript');
    expect(doc.overallReadiness).toBe(65);
    expect(doc.strengthAreas).toEqual(['React', 'CSS']);
    expect(doc.createdAt).toBeDefined();
  });

  it('should require userId', async () => {
    const data = validData();
    (data as any).userId = undefined;

    await expect(GapAnalysisResult.create(data)).rejects.toThrow();
  });

  it('should require targetRole.title', async () => {
    const data = validData();
    (data as any).targetRole = { roleId: new mongoose.Types.ObjectId() };

    await expect(GapAnalysisResult.create(data)).rejects.toThrow();
  });

  it('should require overallReadiness', async () => {
    const data = validData();
    (data as any).overallReadiness = undefined;

    await expect(GapAnalysisResult.create(data)).rejects.toThrow();
  });

  it('should enforce overallReadiness range 0-100', async () => {
    const data = validData();
    data.overallReadiness = 150;

    await expect(GapAnalysisResult.create(data)).rejects.toThrow();
  });

  it('should enforce gap priority enum', async () => {
    const data = validData();
    (data.gaps[0] as any).priority = 'invalid';

    await expect(GapAnalysisResult.create(data)).rejects.toThrow();
  });

  it('should store multiple gaps', async () => {
    const data = validData();
    (data.gaps as any[]).push({
      skillId: 'ts',
      skillName: 'TypeScript',
      currentLevel: 1,
      requiredLevel: 3,
      gapSize: 2,
      priority: 'medium' as const,
      importance: 'good_to_have',
      estimatedTimeToClose: 40,
    });

    const doc = await GapAnalysisResult.create(data);
    expect(doc.gaps).toHaveLength(2);
  });

  it('should return results sorted by analyzedAt descending', async () => {
    const userId = new mongoose.Types.ObjectId();
    const base = validData();

    await GapAnalysisResult.create({
      ...base,
      userId,
      overallReadiness: 50,
      analyzedAt: new Date('2024-01-01'),
    });

    await GapAnalysisResult.create({
      ...base,
      userId,
      overallReadiness: 80,
      analyzedAt: new Date('2024-06-01'),
    });

    const results = await GapAnalysisResult.find({ userId })
      .sort({ analyzedAt: -1 })
      .lean();

    expect(results).toHaveLength(2);
    expect(results[0].overallReadiness).toBe(80);
    expect(results[1].overallReadiness).toBe(50);
  });

  it('should include id in toJSON output', async () => {
    const doc = await GapAnalysisResult.create(validData());
    const json = doc.toJSON();

    expect(json.id).toBe(doc._id.toString());
  });
});
