'use strict';

/**
 * Module dependencies.
 */

require('should');
var jjv = require('jjv');

var jjve = require('../jjve');

/**
 * Tests
 */

describe('jjve', function() {
  describe('render', function() {
    beforeEach(function() {
      var self = this;

      self.env = jjv();
      self.jjve = jjve(self.env);

      self.run = function(schema, data) {
        return self.jjve(schema, data, self.env.validate(schema, data));
      };
    });

    it('shound handle empty schema', function() {
      var data = {};
      var schema = {};

      this.run(schema, data).should.eql([]);
    });

    it('shound handle undefined base type', function() {
      var data;
      var schema = { type: 'object' };

      this.run(schema, data).should.eql([
        {
          code: 'VALIDATION_INVALID_TYPE',
          message: 'Invalid type: undefined should be object',
          path: '$',
        }
      ]);
    });

    it('shound handle invalid base type', function() {
      var data = 123;
      var schema = { type: 'object' };

      this.run(schema, data).should.eql([
        {
          code: 'VALIDATION_INVALID_TYPE',
          data: 123,
          message: 'Invalid type: integer should be object',
          path: '$',
        }
      ]);
    });

    it('shound handle missing property', function() {
      var data = {};
      var schema = {
        type: 'object',
        required: ['must'],
        properties: { must: { type: 'string' } },
      };

      this.run(schema, data).should.eql([
        {
          code: 'VALIDATION_OBJECT_REQUIRED',
          message: 'Missing required property: must',
          path: '$.must',
        }
      ]);
    });

    it('shound handle invalid property (object)', function() {
      var data = { test: {} };
      var schema = {
        type: 'object',
        properties: { test: { type: 'string' } },
      };

      this.run(schema, data).should.eql([
        {
          code: 'VALIDATION_INVALID_TYPE',
          data: {},
          message: 'Invalid type: object should be string',
          path: '$.test',
        }
      ]);
    });

    it('shound handle invalid property (array)', function() {
      var data = { test: [] };
      var schema = {
        type: 'object',
        properties: { test: { type: 'string' } },
      };

      this.run(schema, data).should.eql([
        {
          code: 'VALIDATION_INVALID_TYPE',
          data: [],
          message: 'Invalid type: array should be string',
          path: '$.test',
        }
      ]);
    });

    it('shound handle minimum', function() {
      var data = 50;
      var schema = { type: 'integer', minimum: 100 };

      this.run(schema, data).should.eql([
        {
          code: 'VALIDATION_MINIMUM',
          data: 50,
          message: 'Value 50 is less than minimum 100',
          path: '$',
        }
      ]);
    });

    it('shound handle maximum', function() {
      var data = 50;
      var schema = { type: 'integer', maximum: 25 };

      this.run(schema, data).should.eql([
        {
          code: 'VALIDATION_MAXIMUM',
          data: 50,
          message: 'Value 50 is greater than maximum 25',
          path: '$',
        }
      ]);
    });

    it('shound handle multipleOf', function() {
      var data = 15;
      var schema = { type: 'integer', multipleOf: 10 };

      this.run(schema, data).should.eql([
        {
          code: 'VALIDATION_MULTIPLE_OF',
          data: 15,
          message: 'Value 15 is not a multiple of 10',
          path: '$',
        }
      ]);
    });

    it('shound handle pattern', function() {
      var data = 'abc';
      var schema = { type: 'string', pattern: '\\d+' };

      this.run(schema, data).should.eql([
        {
          code: 'VALIDATION_PATTERN',
          data: 'abc',
          message: 'String does not match pattern: \\d+',
          path: '$',
        }
      ]);
    });

    it('shound handle minLength', function() {
      var data = 'abc';
      var schema = { type: 'string', minLength: 10 };

      this.run(schema, data).should.eql([
        {
          code: 'VALIDATION_MIN_LENGTH',
          data: 'abc',
          message: 'String is too short (3 chars), minimum 10',
          path: '$',
        }
      ]);
    });

    it('shound handle maxLength', function() {
      var data = 'abc';
      var schema = { type: 'string', maxLength: 2 };

      this.run(schema, data).should.eql([
        {
          code: 'VALIDATION_MAX_LENGTH',
          data: 'abc',
          message: 'String is too long (3 chars), maximum 2',
          path: '$',
        }
      ]);
    });

    it('shound handle minItems', function() {
      var data = ['one'];
      var schema = { type: 'array', minItems: 10 };

      this.run(schema, data).should.eql([
        {
          code: 'VALIDATION_ARRAY_LENGTH_SHORT',
          data: ['one'],
          message: 'Array is too short (1), minimum 10',
          path: '$',
        }
      ]);
    });

    it('shound handle maxItems', function() {
      var data = ['one', 'two'];
      var schema = { type: 'array', maxItems: 1 };

      this.run(schema, data).should.eql([
        {
          code: 'VALIDATION_ARRAY_LENGTH_LONG',
          data: ['one', 'two'],
          message: 'Array is too long (2), maximum 1',
          path: '$',
        }
      ]);
    });

    it('shound handle uniqueItems', function() {
      var data = ['one', 'two', 'one'];
      var schema = { type: 'array', uniqueItems: true };

      this.run(schema, data).should.eql([
        {
          code: 'VALIDATION_ARRAY_UNIQUE',
          data: ['one', 'two', 'one'],
          message: 'Array items are not unique',
          path: '$',
        }
      ]);
    });

    it('shound handle minProperties', function() {
      var data = { one: 1 };
      var schema = { type: 'object', minProperties: 2 };

      this.run(schema, data).should.eql([
        {
          code: 'VALIDATION_OBJECT_PROPERTIES_MINIMUM',
          data: { one: 1 },
          message: 'Too few properties defined (1), minimum 2',
          path: '$',
        }
      ]);
    });

    it('shound handle maxProperties', function() {
      var data = { one: 1, two: 2 };
      var schema = { type: 'object', maxProperties: 1 };

      this.run(schema, data).should.eql([
        {
          code: 'VALIDATION_OBJECT_PROPERTIES_MAXIMUM',
          data: { one: 1, two: 2 },
          message: 'Too many properties defined (2), maximum 1',
          path: '$',
        }
      ]);
    });

    it('shound handle enum', function() {
      var data = 'three';
      var schema = { type: 'string', enum: ['one', 'two'] };

      this.run(schema, data).should.eql([
        {
          code: 'VALIDATION_ENUM_MISMATCH',
          data: 'three',
          message: 'No enum match (three), expects: one, two',
          path: '$',
        }
      ]);
    });

    it('shound handle not', function() {
      var data = 'abc';
      var schema = { type: 'string', not: { type: 'string', pattern: 'c$' } };

      this.run(schema, data).should.eql([
        {
          code: 'VALIDATION_NOT_PASSED',
          data: 'abc',
          message: 'Data matches schema from "not"',
          path: '$',
        }
      ]);
    });

    it('shound handle additionalProperties', function() {
      var data = { one: '1', two: { one: '1', two: 2 } };
      var schema = {
        type: 'object',
        properties: { one: { type: 'integer' } },
        additionalProperties: {
          type: 'object',
          properties: { one: { type: 'integer' } },
          additionalProperties: { type: 'string' },
        },
      };

      this.run(schema, data).should.eql([
        {
          code: 'VALIDATION_INVALID_TYPE',
          data: '1',
          message: 'Invalid type: string should be integer',
          path: '$.one'
        },
        {
          code: 'VALIDATION_INVALID_TYPE',
          data: '1',
          message: 'Invalid type: string should be integer',
          path: '$.two.one'
        },
        {
          code: 'VALIDATION_INVALID_TYPE',
          data: 2,
          message: 'Invalid type: integer should be string',
          path: '$.two.two'
        },
      ]);
    });

    it('shound handle additionalProperties (boolean) @test', function() {
      var data = { one: 1 };
      var schema = { type: 'object', additionalProperties: false };

      this.run(schema, data).should.eql([
        {
          code: 'VALIDATION_ADDITIONAL_PROPERTIES',
          data: 1,
          message: 'Additional properties not allowed: one',
          path: '$.one',
        }
      ]);
    });

    it('shound handle arrays', function() {
      var data = {
        one: [
          {
            two: [
              { ok: true },
              { ok: 0 },
            ],
          },
        ]
      };
      var schema = {
        type: 'object',
        properties: {
          one: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                two: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      ok: { type: 'boolean' }
                    }
                  },
                }
              }
            }
          }
        }
      };

      this.run(schema, data).should.eql([
        {
          code: 'VALIDATION_INVALID_TYPE',
          message: 'Invalid type: integer should be boolean',
          data: 0,
          path: '$.one[0].two[1].ok',
        }
      ]);
    });

    it('shound handle patternProperties', function() {
      var data = {
        ok: true
      };
      var schema = {
        type: 'object',
        patternProperties: {
          '.*': { type: 'integer' },
        }
      };

      this.run(schema, data).should.eql([
        {
          code: 'VALIDATION_INVALID_TYPE',
          message: 'Invalid type: boolean should be integer',
          data: true,
          path: '$.ok',
        }
      ]);
    });

    it('shound handle definitions', function() {
      var data = { one: { two: '3' } };
      var schema = {
        type: 'object',
        properties: {
          one: { $ref: '#/definitions/one' },
        },
        definitions: {
          one: {
            type: 'object',
            properties: {
              two: {
                type: 'string',
                enum: ['1', '2']
              },
            },
          },
        },
      };

      this.run(schema, data).should.eql([
        {
          code: 'VALIDATION_ENUM_MISMATCH',
          message: 'No enum match (3), expects: 1, 2',
          data: '3',
          path: '$.one.two',
        }
      ]);
    });
  });
});
