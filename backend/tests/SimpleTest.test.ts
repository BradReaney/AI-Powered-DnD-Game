import { describe, it, expect } from '@jest/globals';

describe('Simple Test Suite', () => {
  it('should pass basic arithmetic', () => {
    expect(2 + 2).toBe(4);
    expect(10 - 5).toBe(5);
    expect(3 * 4).toBe(12);
    expect(15 / 3).toBe(5);
  });

  it('should handle string operations', () => {
    expect('Hello' + ' ' + 'World').toBe('Hello World');
    expect('Test'.length).toBe(4);
    expect('Jest'.toUpperCase()).toBe('JEST');
  });

  it('should work with arrays', () => {
    const numbers = [1, 2, 3, 4, 5];
    expect(numbers.length).toBe(5);
    expect(numbers[0]).toBe(1);
    expect(numbers[numbers.length - 1]).toBe(5);
    expect(numbers.includes(3)).toBe(true);
  });

  it('should work with objects', () => {
    const person = {
      name: 'John',
      age: 30,
      city: 'New York',
    };

    expect(person.name).toBe('John');
    expect(person.age).toBe(30);
    expect(person.city).toBe('New York');
    expect(Object.keys(person)).toHaveLength(3);
  });

  it('should handle async operations', async () => {
    const result = await Promise.resolve('async result');
    expect(result).toBe('async result');
  });
});
