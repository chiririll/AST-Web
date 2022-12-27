import codecs
import json

from Types import *

SUBJ = "boss"
VERSION = "1.2"

INPUT = f"questions/{SUBJ}.txt"
OUTPUT = f"../docs/scripts/questions_{SUBJ}_v{VERSION}.js"
MAX_TYPE_LEN = 3


def read_file(path: str) -> list[str]:
    f = open(path, 'r', encoding='utf-8')
    lines = []

    for line in f.readlines():
        if line.strip() == "":
            continue
        lines.append(line)

    f.close()
    return lines


def get_question_type(sym: str) -> QuestionType:
    pass


def get_line_type(line: str) -> tuple[LineType, str]:
    parts = line.split(':', 2)

    if len(parts) < 2:
        return LineType.Unknown, line

    parts[0] = parts[0].replace(' ', '')

    if 1 > len(parts[0]) > MAX_TYPE_LEN:
        return LineType.Unknown, line

    parts[1] = parts[1].replace('\n', '').replace('\r', '').strip()

    match parts[0][0]:
        case 'I':
            return LineType.Index, parts[1]
        case 'S':
            return LineType.Question, parts[1]
        case 'Q':
            return LineType.Task, parts[1]
        case 'V':
            return LineType.Theme, parts[1]

    # Otherwise it may be option
    return LineType.Option, ': '.join(parts)


def is_new_question(line_type: LineType, question: dict) -> bool:
    if question is None:
        return True

    if line_type not in [LineType.Index, LineType.Task, LineType.Question]:
        return False

    if len(question.get('vars', [])) < 1:
        return False

    return True


def create_new_question(**params) -> dict:
    return {
        'type': params.get('type', ""),
        'theme': params.get('theme', ""),
        'task': params.get('task', ""),
        'question': params.get('question', ""),
        'vars': params.get('vars', [])
    }


def find_question_type(quest: dict) -> QuestionType:
    if quest is None or type(quest.get('vars')) is not list or len(quest['vars']) < 1:
        return QuestionType.Unknown

    types = {}
    for t in [q.split(':', 2)[0] for q in quest['vars']]:
        if t[0] in ['L', 'R']:
            t = t[0]

        if types.get(t) is None:
            types[t] = 0
        types[t] += 1

    if types.get('+', 0) == 1 and types.get('-', 0) >= 1:
        return QuestionType.Single
    if types.get('+', 0) > 1 and types.get('-', 0) >= 1:
        return QuestionType.Multiple
    if (types.get('+', 0) >= 1 or types.get('#', 0) >= 1) and len(types) <= 2:
        return QuestionType.Enter

    # Other type (not + and -)
    if types.get('L', 0) > 0 and types.get('R', 0) > 0:
        return QuestionType.Compliance

    # Check compliance
    for t in types.keys():
        try:
            i = int(t)
        except ValueError:
            return QuestionType.Unknown
    return QuestionType.Order


def parse_questions(lines: list[str]) -> list[dict]:
    def add_curr_question(q: dict, qlist: list[dict]):
        if q is None:
            return
        q['type'] = find_question_type(q)
        print(f"Done! Type: {q['type']}")
        qlist.append(q)

    questions = []
    current_theme = ""

    curr = None
    last_line_type = None

    for l in lines:
        line_type, line = get_line_type(l)

        if is_new_question(line_type, curr):
            add_curr_question(curr, questions)
            print(f"Adding qusetion #{len(questions)}...", end=' ')
            curr = create_new_question(theme=current_theme)

        if last_line_type == LineType.Question and line_type == LineType.Unknown:
            curr['question'] += '\n' + line
            continue

        match line_type:
            case LineType.Index:
                # TODO
                pass
            case LineType.Theme:
                current_theme = line
                pass
            case LineType.Task:
                curr['task'] = line
            case LineType.Question:
                curr['question'] = line
            case LineType.Option:
                curr['vars'].append(line)

        last_line_type = line_type

    add_curr_question(curr, questions)
    print(f"\nAdded {len(questions)} questions")

    return questions


def write_to_file(path: str, questions: list) -> None:
    with codecs.open(path, 'w', 'utf-8') as file:
        file.write(u'\ufeff')
        file.write("questions = ")
        file.writelines(json.dumps(questions, ensure_ascii=False))


def main():
    lines = read_file(INPUT)
    questions = parse_questions(lines)
    write_to_file(OUTPUT, questions)


if __name__ == "__main__":
    main()
