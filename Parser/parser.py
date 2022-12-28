import codecs
import json

from Types import *

SUBJ = "boss"
VERSION = "1.3"

INPUT = f"questions/{SUBJ}.txt"
OUTPUT = f"../docs/scripts/questions_{SUBJ}_v{VERSION}.js"
MAX_TYPE_LEN = 3


def read_file(path: str) -> list[str]:
    f = open(path, 'r', encoding='utf-8')
    lines = []

    for line in f.readlines():
        if line.strip() == "":
            continue
        lines.append(line.replace('\n', '').replace('\r', ''))

    f.close()
    return lines


def get_line_type(line: str) -> tuple[LineType, str]:
    parts = line.split(':', 1)

    if len(parts) < 2:
        return LineType.Unknown, line

    parts[0] = parts[0].replace(' ', '')

    if 1 > len(parts[0]) > MAX_TYPE_LEN:
        return LineType.Unknown, line

    parts[1] = parts[1].strip()

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


def is_new_question(line_type: LineType, question: Question) -> bool:
    if question is None:
        return True

    if line_type not in [LineType.Index, LineType.Task, LineType.Question]:
        return False

    return question.is_complete()


def parse_questions(lines: list[str]) -> list[dict]:
    questions = []
    current_theme = ""

    curr = None
    last_line_type = None

    for ln in lines:
        line_type, line = get_line_type(ln)

        if is_new_question(line_type, curr):
            if curr is not None:
                questions.append(curr)

            print(f"Adding qusetion #{len(questions)}")
            curr = Question(theme=current_theme)

        if line_type == LineType.Unknown:
            if last_line_type == LineType.Question:
                curr.append_question(line)
            if last_line_type == LineType.Option:
                curr.append_option(line)
            continue

        match line_type:
            case LineType.Index:
                # TODO
                pass
            case LineType.Theme:
                current_theme = line
                pass
            case LineType.Task:
                curr.set_task(line)
            case LineType.Question:
                curr.set_question(line)
            case LineType.Option:
                curr.add_option(line)

        last_line_type = line_type

    if curr is not None:
        questions.append(curr)

    print(f"\nAdded {len(questions)} questions")

    return [x.compile() for x in questions]


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
