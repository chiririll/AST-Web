from enum import Enum


class LineType(Enum):
    Theme = 'V'
    Index = 'I'
    Task = 'S'
    Question = 'Q'
    Option = ':'

    Unknown = -1


class QuestionType:
    Single = "single"
    Multiple = "many"
    Enter = "enter"
    Compliance = "compliance"
    Order = "order"

    Unknown = "unknown"
