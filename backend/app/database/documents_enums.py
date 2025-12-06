import enum

class DocumentCategory(str, enum.Enum):
    VORLESUNG = "Vorlesung"
    UEBUNG = "Übung"
    PRUEFUNG = "Prüfung"
    NOTIZEN = "Notizen"
    ZUSAMMENFASSUNG = "Zusammenfassung"
    SONSTIGES = "Sonstiges"
