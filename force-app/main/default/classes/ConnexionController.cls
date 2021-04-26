public with sharing class ConnexionController {
  @AuraEnabled(cacheable=true)
  public static boolean getIsBasic(ID connexionId) {
    Connexion__c connexion = getConnexionById(connexionId);
    return connexion.RecordType.Name == 'Basic Auth';
  }

  @AuraEnabled
  public static boolean negateActivation(ID connexionId) {
    Connexion__c connexion = getConnexionById(connexionId);
    connexion.isActive__c = !connexion.isActive__c;
    if (!Schema.sObjectType.Connexion__c.fields.Name.isUpdateable()) {
      return null;
    }
    update connexion;
    return connexion.isActive__c;
  }

  // public boolean editPassword(ID recordId){

  // }

  private static Connexion__c getConnexionById(ID connexionId) {
    return [
      SELECT RecordType.Name, isActive__c
      FROM connexion__c
      WHERE id = :connexionId
      WITH SECURITY_ENFORCED
    ];
  }
}
