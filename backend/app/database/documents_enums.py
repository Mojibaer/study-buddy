import enum

class DocumentCategory(str, enum.Enum):
    VORLESUNG = "Vorlesung"
    UEBUNG = "Übung"
    PRUEFUNG = "Prüfung"
    NOTIZEN = "Notizen"
    ZUSAMMENFASSUNG = "Zusammenfassung"
    SONSTIGES = "Sonstiges"

#alle fächer definieren
#datenbank struktur für fächer zu semester relation -> extra tabelle für fächer oder mit tabelle documents genug