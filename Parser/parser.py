import codecs
import json

FILENAME = "questions/OIB.txt"


def is_int(s):
    try:
        int(s)
        return True
    except ValueError:
        return False


def get_type(sym):
    if sym in ['+', '-'] and q['type'] == '':
        return 'single'
    elif sym in ['+', '-']:
        return 'many'
    elif sym in ['R', 'L']:
        return 'compliance'
    elif is_int(sym):
        return 'order'
    else:
        return None


def main():
    questions = []
    last_line = ''
    q = None

    f = open(FILENAME, encoding='utf-8')

    for line in f.readlines():
        line = line.replace('\r', '').replace('\n', '').strip()
        if not len(line):
            continue

        if len(line) > 1 and line[1] == ':':
            pass


        if line[0] in ['I', 'Q', 'S'] and len(q['vars']) != 0 or q is None:
            questions.append(q)
            q = {'type': "", 'theme': "", 'task': "", 'question': "", 'vars': []}

        if line[0] == 'I':
            q['theme'] = line.split('}')[-1][1:].strip()
            last_line = 'theme'
        elif line[0] == 'Q':
            q['task'] = line[2:].strip()
            last_line = 'task'
        elif line[0] == 'S':
            q['question'] = line[2:].strip()
            last_line = 'question'
        elif line[0] == 'V':
            # TODO: Add theme
            last_line = 'theme'
        elif line[0] in ['+', '-', 'R', 'L'] or is_int(line[0]):
            q['vars'].append(line)
            q['type'] = get_type(line[0])
            last_line = 'variant'
        elif len(line) > 1 and line[1] == ':':
            match last_line:
                case 'question':
                    q['question'] += ' ' + line
                case 'variant':
                    q['vars'][-1] += ' ' + line
                case 'theme':
                    pass

    del q
    del questions[0]
    f.close()

    for q in questions:
        if q is None or q['type'] in ["compliance", "order"]:
            continue

        bad_answers = 0
        for var in q['vars']:
            if var[0] == '-':
                bad_answers += 1
        if bad_answers == 0:
            q['type'] = "enter"
        elif len(q['vars']) - bad_answers > 1:
            q['type'] = "many"
        else:
            q['type'] = "single"

    with codecs.open("../docs/scripts/questions.js", "w", "utf-8") as file:
        file.write(u'\ufeff')
        file.write("questions = ")
        file.writelines(json.dumps(questions, ensure_ascii=False))

    print(len(questions))


if __name__ == "__main__":
    main()
