public with sharing class ConnexionController {
  @AuraEnabled(cacheable=true)
  public static boolean getIsBasic(Id connexionId) {
    Connexion__c connexion = getConnexionById(connexionId);
    return connexion.RecordType.Name == 'Basic Auth';
  }

  @AuraEnabled
  public static boolean negateActivation(Id connexionId) {
    Connexion__c connexion = getConnexionById(connexionId);
    connexion.isActive__c = !connexion.isActive__c;
    if (!Schema.sObjectType.Connexion__c.fields.Name.isUpdateable()) {
      return null;
    }
    update connexion;
    return connexion.isActive__c;
  }

  @AuraEnabled
  public static String getConnexionPassword(Id connexionId){
    return [SELECT Id, Password__c FROM Connexion__c WHERE Id = :connexionId].Password__c;
  }

  // public boolean editPassword(ID recordId){

  // }

  private static Connexion__c getConnexionById(ID connexionId) {
    return [
      SELECT RecordType.Name, isActive__c
      FROM connexion__c
      WHERE Id = :connexionId
      WITH SECURITY_ENFORCED
    ];
  }
}
