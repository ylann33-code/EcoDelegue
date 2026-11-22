# Documents partagés

Pour publier un document :
1. Déposez le fichier dans ce dossier (`documents/`).
2. Ajoutez une entrée dans `documents.json` en indiquant son nom exact dans `file`.

Exemple :
```json
[
  {
    "title": "Compte rendu de réunion",
    "date": "2026-11-22",
    "file": "compte-rendu-reunion.pdf",
    "description": "Compte rendu de la réunion de novembre."
  },
  {
    "title": "Guide écologique",
    "date": "2026-11-20",
    "file": "guide-ecologie.odt",
    "description": "Guide à télécharger."
  }
]
```

Le champ `file` est relatif à ce dossier et doit correspondre exactement au nom du fichier (majuscules, espaces et extension compris). Les PDF disposent d'un aperçu intégré. Les autres formats, dont ODT, sont proposés au téléchargement ; leur aperçu dépend du navigateur et n'est pas garanti.
