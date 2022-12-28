from .Enums import QuestionType


MAX_OPT_LEN = 3


class Question:
    def __init__(self, **params):
        self.__type = None
        self.__opts_list = []
        self.__options = {'+': [], '-': [], 'L': [], 'R': [], 'order': []}

        self.__theme = params.get('theme', "")
        self.__task = params.get('task', "")
        self.__question = params.get('question', "")

        for opt in params.get('opts', []):
            self.add_option(opt)

    def __str__(self):
        return {
            'type': self.__type,
            'theme': self.__theme,
            'task': self.__task,
            'question': self.__question,
            'opts': self.__options
        }

    def compile(self) -> dict:
        self.__update_type()
        return {
            'type': self.__type,
            'theme': self.__theme,
            'task': self.__task,
            'question': self.__question,
            'opts': self.__generate_options()
        }

    def set_task(self, task: str) -> None:
        self.__task = task

    def set_question(self, question: str) -> None:
        self.__question = question

    def append_question(self, line: str) -> None:
        if self.__question == "":
            return self.set_question(line)
        self.__question += '\n' + line

    def set_theme(self, theme: str):
        self.__theme = theme

    def add_option(self, option: str) -> None:
        self.__opts_list.append(option)

    def append_option(self, line: str) -> None:
        self.__opts_list[-1] += '\n' + line

    def is_complete(self) -> bool:
        return len(self.__opts_list) > 0

    def define_type(self) -> QuestionType:
        # Select
        if len(self.__options['+']) == 1 and len(self.__options['-']) >= 1:
            return QuestionType.Single
        if len(self.__options['+']) > 1 and len(self.__options['-']) >= 1:
            return QuestionType.Multiple

        # Enter
        if len(self.__options['+']) >= 1 and len(self.__options['-']) == 0:
            return QuestionType.Enter

        # Compliance
        if len(self.__options['L']) > 0 and len(self.__options['R']) > 0:
            return QuestionType.Compliance

        # Order
        if len(self.__options['order']) > 0:
            return QuestionType.Order

        return QuestionType.Unknown

    def __update_type(self) -> None:
        self.__update_options()
        self.__type = self.define_type()

    def __update_options(self):
        for opt in self.__opts_list:
            parts = opt.split(':', 1)
            if len(parts[0]) < 1 or len(parts[0]) > MAX_OPT_LEN:
                return

            parts[1] = parts[1].strip()

            # Get rid of # in enter questions
            if parts[0][0] == '#':
                parts[0] = '+' + parts[0][1:]

            if parts[0][0] in self.__options.keys():
                self.__options[parts[0][0]].append(parts[1])
            else:
                try:
                    idx = int(parts[0])
                    self.__options['order'].insert(idx, [idx, parts[1]])
                except ValueError:
                    pass

    def __fix_compliance(self) -> None:
        if len(self.__options['L']) == 0 or len(self.__options['R']) == 0:
            return

        avg_left = sum([len(x) for x in self.__options['L']]) / len(self.__options['L'])
        avg_right = sum([len(x) for x in self.__options['R']]) / len(self.__options['R'])

        if avg_right > avg_left:
            self.__options['L'], self.__options['R'] = self.__options['R'], self.__options['L']

        # Adding empty strings to equalize
        for i in range(max(len(self.__options['R']), len(self.__options['R']))):
            if i > len(self.__options['L']):
                self.__options['L'].append("")
            if i > len(self.__options['R']):
                self.__options['R'].append("")

    def __generate_options(self) -> list:
        def list2zip(lst: list, val) -> list:
            return list(zip(lst, [val for _ in range(len(lst))]))

        options = []

        if self.__type in [QuestionType.Single, QuestionType.Multiple]:
            options.extend(list2zip(self.__options['+'], True))
            options.extend(list2zip(self.__options['-'], False))

        elif self.__type == QuestionType.Enter:
            options.extend(self.__options['+'])

        elif self.__type == QuestionType.Compliance:
            self.__fix_compliance()
            options.extend(list(zip(self.__options['L'], self.__options['R'])))

        elif self.__type == QuestionType.Order:
            options.extend(self.__options['order'])

        return options
