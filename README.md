## GET `/lessons/find`

Returns lessons matching the specified filters.

All query parameters are optional. When no filters are provided, the endpoint returns all lessons from the database.

### Query parameters

| Parameter | Type     | Required | Matching    | Description                                                |
| --------- | -------- | -------- | ----------- | ---------------------------------------------------------- |
| `day`     | `string` | No       | Exact (`=`) | Day of the week. Uses the numeric value of the `Day` enum. |
| `hour`    | `string` | No       | Exact (`=`) | Lesson hour.                                               |
| `class`   | `string` | No       | `LIKE`      | Class name.                                                |
| `teacher` | `string` | No       | `LIKE`      | Teacher name.                                              |
| `subject` | `string` | No       | `LIKE`      | Subject name.                                              |
| `room`    | `string` | No       | `LIKE`      | Classroom/room name.                                       |

Multiple filters can be combined. When multiple filters are provided, all of them must match (`AND`).

### Day values

The `day` parameter uses the numeric values defined by the `Day` enum:

| Value | Day       |
| ----: | --------- |
|   `0` | Monday    |
|   `1` | Tuesday   |
|   `2` | Wednesday |
|   `3` | Thursday  |
|   `4` | Friday    |
|   `5` | Saturday  |
|   `6` | Sunday    |

For example:

```http
GET /lessons/find?day=0
```

returns lessons scheduled for Monday.

### Matching behavior

The `day` and `hour` filters use exact matching:

```text
day = value
hour = value
```

The `class`, `teacher`, `subject`, and `room` filters use SQLite's `LIKE` operator:

```text
class LIKE value
teacher LIKE value
subject LIKE value
room LIKE value
```

The API does not automatically add `%` wildcards to these values. Therefore, partial matching can be explicitly requested by including `%` in the query parameter.

For example:

```http
GET /lessons/find?subject=%math%
```

uses:

```sql
subject LIKE '%math%'
```

whereas:

```http
GET /lessons/find?subject=math
```

uses:

```sql
subject LIKE 'math'
```

### Examples

#### Get all lessons

```http
GET /lessons/find
```

#### Get all Monday lessons

```http
GET /lessons/find?day=0
```

#### Get lessons for a specific hour

```http
GET /lessons/find?hour=8
```

#### Find lessons for a specific class

```http
GET /lessons/find?class=3A
```

#### Find lessons by teacher

```http
GET /lessons/find?teacher=Kowalski
```

#### Find lessons by subject using partial matching

```http
GET /lessons/find?subject=%math%
```

#### Combine multiple filters

```http
GET /lessons/find?day=0&hour=8&class=3A
```

The above request returns lessons matching all three conditions:

```text
day = 0
AND hour = 8
AND class LIKE '3A'
```

### Successful response

The endpoint returns HTTP `200 OK` with an array of `Lesson` objects.

Example:

```json
[
  {
    "id": 1,
    "day": 0,
    "hour": 8,
    "class": "3A",
    "teacher": "John Smith",
    "room": "101",
    "subject": "Mathematics",
    "raw_text": null,
    "is_parsed": 1
  }
]
```

### Lesson object

| Field       | Type     | Nullable | Description                                         |
| ----------- | -------- | -------- | --------------------------------------------------- |
| `id`        | `number` | Yes      | Unique lesson identifier.                           |
| `day`       | `number` | No       | Day of the week. See the `Day` values above.        |
| `hour`      | `number` | No       | Lesson hour.                                        |
| `class`     | `string` | No       | Class/group assigned to the lesson.                 |
| `teacher`   | `string` | Yes      | Teacher assigned to the lesson.                     |
| `room`      | `string` | Yes      | Room in which the lesson takes place.               |
| `subject`   | `string` | Yes      | Lesson subject.                                     |
| `raw_text`  | `string` | Yes      | Original, unparsed text associated with the lesson. |
| `is_parsed` | `0 \| 1` | No       | Indicates whether the lesson data has been parsed.  |

The value of `is_parsed` determines how the lesson data is stored:

| `is_parsed` | `raw_text` | `teacher` | `subject` | `room`    | Description                                                                 |
| ----------: | ---------- | --------- | --------- | --------- | --------------------------------------------------------------------------- |
|         `0` | populated  | `null`    | `null`    | `null`    | Lesson data has not been parsed. The original data is stored in `raw_text`. |
|         `1` | `null`     | populated | populated | populated | Lesson data has been parsed into individual fields.                         |

When `is_parsed` is `0`, the parsed fields `teacher`, `subject`, and `room` are `null` and the original lesson data is available in `raw_text`.

When `is_parsed` is `1`, `raw_text` is `null` and the lesson data is available in the corresponding parsed fields.


### Error response

If a database error occurs, the endpoint returns HTTP `500 Internal Server Error`:

```json
{
  "error": "INTERNAL_ERROR",
  "message": "Database error."
}
```

### Response codes

| Status | Description                     |
| -----: | ------------------------------- |
|  `200` | Request completed successfully. |
|  `500` | Internal database error.        |



## GET `/lessons/count/:class`

Returns the number of lessons grouped by teacher, subject, and raw lesson text for the specified class.

The `class` value is provided as a URL path parameter.

### Path parameters

| Parameter | Type     | Required | Description                                         |
| --------- | -------- | -------- | --------------------------------------------------- |
| `class`   | `string` | Yes      | Class for which lesson counts should be calculated. |

The parameter must:

* be provided,
* contain exactly one value,
* not be empty or consist only of whitespace.

The provided value is trimmed before being used in the database query.

### Matching behavior

The class is matched using SQLite's `LIKE` operator:

```sql
WHERE class LIKE @class
```

The API does not automatically add `%` wildcards.

For example:

```http
GET /lessons/count/3A
```

uses:

```sql
class LIKE '3A'
```

To perform partial matching, `%` can be included in the path parameter:

```http
GET /lessons/count/%3A%
```

which corresponds to:

```sql
class LIKE '%3A%'
```

### Grouping

Results are grouped by:

* `teacher`
* `subject`
* `raw_text`

The response also contains the `class` value and the calculated number of lessons.

The SQL query is equivalent to:

```sql
SELECT class, teacher, subject, raw_text, COUNT(*) as lessonsCount
FROM lessons
WHERE class LIKE @class
GROUP BY teacher, subject, raw_text;
```

### Example request

```http
GET /lessons/count/3A
```

### Successful response

The endpoint returns HTTP `200 OK` with an array of grouped lesson counts.

Example:

```json
[
  {
    "class": "3A",
    "teacher": "John Smith",
    "subject": "Mathematics",
    "raw_text": null,
    "lessonsCount": 4
  },
  {
    "class": "3A",
    "teacher": "Jane Doe",
    "subject": "Physics",
    "raw_text": null,
    "lessonsCount": 2
  }
]
```

### Response fields

| Field          | Type     | Nullable | Description                             |
| -------------- | -------- | -------- | --------------------------------------- |
| `class`        | `string` | No       | Class matching the requested parameter. |
| `teacher`      | `string` | Yes      | Teacher associated with the lessons.    |
| `subject`      | `string` | Yes      | Subject associated with the lessons.    |
| `raw_text`     | `string` | Yes      | Raw lesson text.                        |
| `lessonsCount` | `number` | No       | Number of lessons in the group.         |

`teacher`, `subject`, and `raw_text` can be `null` because the corresponding fields in the `Lesson` model are nullable.

### Error responses

#### Missing parameter

If the `class` parameter is not provided, the endpoint returns HTTP `400 Bad Request`:

```json
{
  "error": "MISSING_REQUIRED_PARAM",
  "message": "'class' param is required."
}
```

#### Multiple parameter values

If the `class` parameter contains multiple values, the endpoint returns HTTP `400 Bad Request`:

```json
{
  "error": "TOO_MANY_PARAM_VALUES",
  "message": "'class' param must contain a single value."
}
```

#### Empty parameter

If the `class` parameter is empty or contains only whitespace, the endpoint returns HTTP `400 Bad Request`:

```json
{
  "error": "INVALID_PARAM",
  "message": "'class' param cannot be empty."
}
```

#### Database error

If a database error occurs, the endpoint returns HTTP `500 Internal Server Error`:

```json
{
  "error": "INTERNAL_ERROR",
  "message": "Database error."
}
```

### Response codes

| Status | Error code               | Description                                                 |
| -----: | ------------------------ | ----------------------------------------------------------- |
|  `200` | —                        | Request completed successfully.                             |
|  `400` | `MISSING_REQUIRED_PARAM` | The `class` parameter was not provided.                     |
|  `400` | `TOO_MANY_PARAM_VALUES`  | The `class` parameter contains multiple values.             |
|  `400` | `INVALID_PARAM`          | The `class` parameter is empty or contains only whitespace. |
|  `500` | `INTERNAL_ERROR`         | Database error.                                             |

